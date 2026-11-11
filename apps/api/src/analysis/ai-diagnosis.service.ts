import { Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';
import type { InsuranceDiagnosisDto, DiagnosisGrade } from '@boim/shared-types';
import {
  RuleBasedDiagnosisEngine,
  type InsuranceProductSummaryItem,
} from './rule-based-diagnosis.engine';

@Injectable()
export class AiDiagnosisService {
  private readonly logger = new Logger(AiDiagnosisService.name);
  private aiClient: GoogleGenAI | null = null;
  private readonly engine: RuleBasedDiagnosisEngine;

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
   * @param userId 분석 대상 사용자 ID
   */
  async diagnoseUserInsurances(userId: bigint): Promise<InsuranceDiagnosisDto> {
    const products = await this.prisma.insuranceProduct.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0) {
      return this.generateEmptyDiagnosis();
    }

    // 1. Gemini AI 호출 시도 (API 키가 준비되어 있는 경우)
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

    // 2. 규칙 기반(Rule-based) 폴백 진단 수행
    return this.generateRuleBasedDiagnosis(products);
  }

  /**
   * Gemini AI 호출 및 구조화된 JSON 파싱
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

    const productSummary = products
      .map(
        (p, idx) =>
          `${idx + 1}. [${p.category}] ${p.institution} - ${p.name} ` +
          `(월납입: ${(p.monthlyPayment ?? 0).toLocaleString()}원, 보장금액: ${Number(p.coverageAmount ?? 0).toLocaleString()}원, 만기일: ${p.maturityDate ? new Date(p.maturityDate).toISOString().split('T')[0] : '미지정'})`,
      )
      .join('\n');

    const prompt = `
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

    const response = await this.aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) return null;

    const parsed = JSON.parse(text);

    return {
      score: typeof parsed.score === 'number' ? parsed.score : 75,
      grade: this.validateGrade(parsed.grade, parsed.score),
      summary: parsed.summary || '종합 보장 분석이 완료되었습니다.',
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
