import { Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI, type Model } from '@google/genai';
import type { InsuranceDiagnosisDto, DiagnosisGrade } from '@boim/shared-types';
import {
  RuleBasedDiagnosisEngine,
  type InsuranceProductSummaryItem,
} from './rule-based-diagnosis.engine';

/**
 * 동적 모델 조회가 실패하거나 미지원 환경일 때 사용하는 기본 모델 폴백 체인
 * (최신 롤링 별칭 -> 안정화 하위 세대 모델 순)
 */
export const DEFAULT_GEMINI_MODEL_CHAIN: readonly string[] = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

const EXCLUDED_MODEL_PATTERNS = [
  'embedding',
  'imagen',
  'veo',
  'tts',
  'aqa',
  'robotics',
  'computer-use',
  'audio',
  'live',
  'deep-research',
];

const MODEL_CACHE_TTL_MS = 60 * 60 * 1000; // 1시간
export const MAX_GEMINI_MODEL_ATTEMPTS = 2; // 1순위 최신 모델 + 2순위 하위 모델까지만 시도

interface ParsedDiagnosisPayload {
  score?: unknown;
  grade?: unknown;
  summary?: unknown;
  categoryEvaluations?: unknown;
  strengths?: unknown;
  improvements?: unknown;
  costSavingTips?: unknown;
}

@Injectable()
export class AiDiagnosisService {
  private readonly logger = new Logger(AiDiagnosisService.name);
  private aiClient: GoogleGenAI | null = null;
  private readonly engine: RuleBasedDiagnosisEngine;
  private cachedDynamicModels: string[] | null = null;
  private modelsCachedAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    @Optional() engine?: RuleBasedDiagnosisEngine,
  ) {
    this.engine = engine ?? new RuleBasedDiagnosisEngine();

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
        this.logger.log('Google GenAI (Gemini) SDK 클라이언트 초기화 성공');
      } catch (err: unknown) {
        this.logger.warn(
          'Google GenAI 초기화 실패, 폴백 엔진으로 대체됩니다:',
          err,
        );
      }
    } else {
      this.logger.log(
        'GEMINI_API_KEY 미설정 - 정밀 규칙 기반 진단 엔진(Rule-based)으로 동작합니다.',
      );
    }
  }

  /**
   * 사용자 가입 보험 종합 진단
   * 1단계: 최신 Gemini 모델 시도
   * 2단계: 실패 시 하위/대체 Gemini 모델 순차 시도
   * 3단계: 모든 AI 모델 실패 시 규칙 기반(Rule-based) 폴백 엔진 구동
   */
  async diagnoseUserInsurances(userId: bigint): Promise<InsuranceDiagnosisDto> {
    const products = await this.prisma.insuranceProduct.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0) {
      return this.generateEmptyDiagnosis();
    }

    if (this.aiClient) {
      try {
        const aiResult = await this.executeGeminiDiagnosis(products);
        if (aiResult) {
          return aiResult;
        }
      } catch (err: unknown) {
        this.logger.warn(
          'Gemini AI 진단 호출 실패, 규칙 기반 폴백 엔진으로 대체합니다:',
          err,
        );
      }
    }

    return this.generateRuleBasedDiagnosis(products);
  }

  /**
   * 사용 가능한 Gemini 모델 목록을 우선순위(최신 -> 하위) 순으로 결정
   */
  async resolveCandidateModels(): Promise<string[]> {
    const ordered = new Set<string>();

    // 1. 명시적 환경변수 모델 우선 적용
    const primaryEnvModel = process.env.GEMINI_MODEL?.trim();
    if (primaryEnvModel) {
      ordered.add(primaryEnvModel);
    }

    const fallbackEnvModels = process.env.GEMINI_FALLBACK_MODELS?.split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    if (fallbackEnvModels) {
      for (const m of fallbackEnvModels) {
        ordered.add(m);
      }
    }

    // 2. Gemini API에서 실시간 사용 가능 모델 동적 조회 (최신 -> 하위 정렬)
    const dynamicModels = await this.getDynamicModelsWithCache();
    for (const model of dynamicModels) {
      ordered.add(model);
    }

    // 3. 동적 조회 실패 또는 누락 시 안전망 정적 체인 추가
    for (const model of DEFAULT_GEMINI_MODEL_CHAIN) {
      ordered.add(model);
    }

    return Array.from(ordered);
  }

  private async getDynamicModelsWithCache(): Promise<string[]> {
    const now = Date.now();
    if (
      this.cachedDynamicModels &&
      now - this.modelsCachedAt < MODEL_CACHE_TTL_MS
    ) {
      return this.cachedDynamicModels;
    }

    if (typeof this.aiClient?.models?.list !== 'function') {
      return [];
    }

    try {
      const pager = await this.aiClient.models.list();
      const rawModels: Model[] = [];

      if (
        pager &&
        typeof (pager as AsyncIterable<Model>)[Symbol.asyncIterator] ===
          'function'
      ) {
        for await (const model of pager as AsyncIterable<Model>) {
          rawModels.push(model);
        }
      } else if (pager && Array.isArray((pager as { page?: Model[] }).page)) {
        rawModels.push(...((pager as { page: Model[] }).page ?? []));
      }

      const ranked = this.filterAndRankModels(rawModels);
      if (ranked.length > 0) {
        this.cachedDynamicModels = ranked;
        this.modelsCachedAt = now;
        this.logger.debug(
          `동적 Gemini 모델 체인 갱신 (${ranked.length}개): ${ranked.slice(0, 5).join(' -> ')}`,
        );
      }
      return ranked;
    } catch (err: unknown) {
      this.logger.warn(
        'Gemini 사용 가능 모델 목록 조회 실패, 기본 모델 체인을 사용합니다:',
        err,
      );
      return [];
    }
  }

  /**
   * generateContent를 지원하는 Gemini 텍스트 모델을 필터링하고 최신 -> 하위 순으로 정렬
   */
  filterAndRankModels(models: Model[]): string[] {
    const candidates = models
      .filter((m) => {
        const rawName = (m.name ?? '').replace(/^models\//, '').toLowerCase();
        if (!rawName.startsWith('gemini-')) return false;
        if (EXCLUDED_MODEL_PATTERNS.some((pat) => rawName.includes(pat))) {
          return false;
        }
        if (
          Array.isArray(m.supportedActions) &&
          m.supportedActions.length > 0 &&
          !m.supportedActions.includes('generateContent')
        ) {
          return false;
        }
        return true;
      })
      .map((m) => (m.name ?? '').replace(/^models\//, ''));

    const unique = Array.from(new Set(candidates));
    return unique.sort((a, b) => this.compareModelPriority(b, a));
  }

  /**
   * 두 모델의 우선순위 비교 (높은 값이 우선: 최신 버전 -> 안정판 -> flash/lite/pro 티어 순)
   */
  private compareModelPriority(a: string, b: string): number {
    const scoreA = this.computeModelScore(a);
    const scoreB = this.computeModelScore(b);
    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }
    return a.localeCompare(b);
  }

  private computeModelScore(modelName: string): number {
    const lower = modelName.toLowerCase();

    // 롤링 'latest' 별칭은 버전 파싱은 안 되지만 최신 세대 대안으로 높은 우선순위 부여
    const versionMatch = lower.match(/^gemini-(\d+(?:\.\d+)?)/);
    const version = versionMatch
      ? parseFloat(versionMatch[1])
      : lower.includes('latest')
        ? 99
        : 0;

    // preview/exp 모델은 동일 세대의 정식(GA) 모델보다 후순위로 배치
    const isExperimental =
      lower.includes('preview') ||
      lower.includes('exp') ||
      /-\d{2,4}$/.test(lower);
    const stabilityScore = isExperimental ? 0 : 100;

    // 티어 가중치: 응답 속도와 JSON 안정성이 좋은 flash -> flash-lite -> pro 순
    let tierScore = 10;
    if (lower.includes('flash-lite')) {
      tierScore = 30;
    } else if (lower.includes('flash')) {
      tierScore = 40;
    } else if (lower.includes('pro')) {
      tierScore = 20;
    }

    return version * 1000 + stabilityScore + tierScore;
  }

  /**
   * Gemini AI 호출 및 구조화된 JSON 파싱 (최신 모델 -> 하위 모델 순차 폴백)
   */
  private async executeGeminiDiagnosis(
    products: InsuranceProductSummaryItem[],
  ): Promise<InsuranceDiagnosisDto | null> {
    if (!this.aiClient) return null;

    const totalMonthlyPayment = products.reduce(
      (sum, p) => sum + (p.monthlyPayment || 0),
      0,
    );
    const totalCoverageAmount = products.reduce(
      (sum, p) => sum + Number(p.coverageAmount || 0),
      0,
    );

    const prompt = this.buildDiagnosisPrompt(
      products,
      totalMonthlyPayment,
      totalCoverageAmount,
    );

    const candidateModels = (await this.resolveCandidateModels()).slice(
      0,
      MAX_GEMINI_MODEL_ATTEMPTS,
    );

    for (const model of candidateModels) {
      try {
        const response = await this.aiClient.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const candidateText = response.text?.trim();
        if (!candidateText) {
          this.logger.warn(
            `Gemini 모델(${model})이 빈 응답을 반환했습니다. 하위 모델로 전환합니다.`,
          );
          continue;
        }

        const parsed = this.parseDiagnosisResponse(candidateText);
        this.logger.log(`Google Gemini AI 진단 성공 (모델: ${model})`);

        return {
          score: typeof parsed.score === 'number' ? parsed.score : 75,
          grade: this.validateGrade(
            parsed.grade,
            typeof parsed.score === 'number' ? parsed.score : 75,
          ),
          summary:
            typeof parsed.summary === 'string' && parsed.summary.trim() !== ''
              ? parsed.summary
              : '종합 보장 분석이 완료되었습니다.',
          totalMonthlyPayment,
          totalCoverageAmount,
          categoryEvaluations: Array.isArray(parsed.categoryEvaluations)
            ? parsed.categoryEvaluations
            : [],
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          improvements: Array.isArray(parsed.improvements)
            ? parsed.improvements
            : [],
          costSavingTips: Array.isArray(parsed.costSavingTips)
            ? parsed.costSavingTips
            : [],
          generatedAt: new Date().toISOString(),
          isFallback: false,
        };
      } catch (err: unknown) {
        this.logger.warn(
          `Gemini 모델(${model}) 호출/파싱 실패, 하위 모델로 전환 시도:`,
          err,
        );
      }
    }

    return null;
  }

  private parseDiagnosisResponse(rawText: string): ParsedDiagnosisPayload {
    const cleanedText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleanedText) as ParsedDiagnosisPayload;
  }

  private buildDiagnosisPrompt(
    products: InsuranceProductSummaryItem[],
    totalMonthlyPayment: number,
    totalCoverageAmount: number,
  ): string {
    const productSummary = products
      .map(
        (p, idx) =>
          `${idx + 1}. [${p.category}] ${p.institution} - ${p.name} ` +
          `(월납입: ${(p.monthlyPayment ?? 0).toLocaleString()}원, 보장금액: ${Number(p.coverageAmount ?? 0).toLocaleString()}원, 만기일: ${p.maturityDate ? new Date(p.maturityDate).toISOString().split('T')[0] : '미지정'})`,
      )
      .join('\n');

    return `
당신은 대한민국 최고 수준의 공인 보험 재무설계사 및 보장 분석 전문가입니다.
아래 사용자가 가입한 실제 보험 목록을 바탕으로 보장 과다/부족을 분석하고 맞춤형 리모델링 조언을 포함한 종합 진단 리포트를 작성해주세요.

[가입 보험 현황]
- 가입 건수: ${products.length}건
- 총 월 납입액: ${totalMonthlyPayment.toLocaleString()}원
- 총 보장금액 합계: ${totalCoverageAmount.toLocaleString()}원
- 상품 상세:
${productSummary}

[진단 기준 안내]
1. 실손의료비는 국민건강보험 보완의 필수 기초 보장입니다. (권장: 5,000만원)
2. 3대 질병(암, 뇌, 심장) 진단비는 최소 3천만원~5천만원 수준이 권장됩니다.
3. 월 총 납입 보험료가 25만원~30만원을 초과할 경우 중복 보장 및 불필요한 특약 절감을 검토해야 합니다.
4. 카테고리 평가 status는 반드시 ['ADEQUATE', 'OVER_COVERED', 'UNDER_COVERED', 'NOT_COVERED'] 중 하나여야 합니다.
5. 종합 등급 grade는 점수(score 0~100)에 따라 ['EXCELLENT', 'GOOD', 'NORMAL', 'NEEDS_ATTENTION', 'WARNING'] 중 하나여야 합니다.

다음 JSON 포맷으로만 응답해주세요 (마크다운 백틱 없이 순수 JSON):
{
  "score": 85,
  "grade": "GOOD",
  "summary": "핵심 실손과 암 보장이 탄탄하게 설계되어 있으나, 뇌/심장 2대 질환 보완이 필요합니다.",
  "categoryEvaluations": [
    {
      "category": "실손",
      "status": "ADEQUATE",
      "currentAmount": 50000000,
      "recommendedAmount": 50000000,
      "comment": "기본 실손의료비가 충분히 마련되어 있습니다."
    }
  ],
  "strengths": [
    "실손의료비 가입으로 일상 병원비 리스크 방어 우수",
    "암 진단비 5,000만원 확보로 중대 질환 대비 완료"
  ],
  "improvements": [
    "뇌혈관/허혈성 심장질환 진단비 한도 추가 확보 권장",
    "만기 시점이 짧은 갱신형 특약 여부 점검 필요"
  ],
  "costSavingTips": [
    "중복 가입된 입원일당 특약 해지 시 월 약 15,000원 절감 가능"
  ]
}
`;
  }

  /**
   * 정밀 규칙 기반(Rule-based) 폴백 진단 엔진에 위임
   */
  generateRuleBasedDiagnosis(
    products: InsuranceProductSummaryItem[],
  ): InsuranceDiagnosisDto {
    return this.engine.generateDiagnosis(products);
  }

  /**
   * 보험 데이터가 없을 때의 Empty 진단 결과 위임
   */
  generateEmptyDiagnosis(): InsuranceDiagnosisDto {
    return this.engine.generateEmptyDiagnosis();
  }

  scoreToGrade(score: number): DiagnosisGrade {
    return this.engine.scoreToGrade(score);
  }

  validateGrade(grade: unknown, score: number): DiagnosisGrade {
    return this.engine.validateGrade(grade, score);
  }
}
