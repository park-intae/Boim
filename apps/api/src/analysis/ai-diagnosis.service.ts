import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';
import type {
  InsuranceDiagnosisDto,
  DiagnosisGrade,
  CategoryEvaluation,
} from '@boim/shared-types';

interface StandardRecommendation {
  category: string;
  recommendedAmount: number;
  description: string;
}

const STANDARD_RECOMMENDATIONS: StandardRecommendation[] = [
  {
    category: '실손',
    recommendedAmount: 50000000,
    description: '기본 일상 의료비 보장 (입원/통원)',
  },
  {
    category: '암/건강',
    recommendedAmount: 50000000,
    description: '3대 주요 질병(암, 뇌혈관, 허혈성 심장질환) 진단비',
  },
  {
    category: '종신',
    recommendedAmount: 100000000,
    description: '가족을 위한 일반사망/질병사망 보장',
  },
  {
    category: '자동차',
    recommendedAmount: 30000000,
    description: '운전자 벌금, 변호사 선임비용 및 형사합의금',
  },
];

@Injectable()
export class AiDiagnosisService {
  private readonly logger = new Logger(AiDiagnosisService.name);
  private aiClient: GoogleGenAI | null = null;

  constructor(private readonly prisma: PrismaService) {
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
    products: any[],
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
          `(월납입: ${p.monthlyPayment.toLocaleString()}원, 보장금액: ${Number(p.coverageAmount).toLocaleString()}원, 만기일: ${new Date(p.maturityDate).toISOString().split('T')[0]})`,
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
   * 정밀 규칙 기반(Rule-based) 폴백 진단 엔진
   */
  generateRuleBasedDiagnosis(products: any[]): InsuranceDiagnosisDto {
    const totalMonthlyPayment = products.reduce(
      (sum, p) => sum + (p.monthlyPayment || 0),
      0,
    );
    const totalCoverageAmount = products.reduce(
      (sum, p) => sum + Number(p.coverageAmount || 0),
      0,
    );

    // 카테고리별 보장액 집계
    const categoryTotals: Record<string, number> = {
      실손: 0,
      '암/건강': 0,
      종신: 0,
      자동차: 0,
      기타: 0,
    };

    products.forEach((p) => {
      const cat = p.category || '';
      const amount = Number(p.coverageAmount || 0);

      if (
        cat.includes('실손') ||
        cat.includes('의료') ||
        cat.includes('실비')
      ) {
        categoryTotals['실손'] += amount;
      } else if (
        cat.includes('암') ||
        cat.includes('건강') ||
        cat.includes('뇌') ||
        cat.includes('심장')
      ) {
        categoryTotals['암/건강'] += amount;
      } else if (
        cat.includes('종신') ||
        cat.includes('정기') ||
        cat.includes('사망')
      ) {
        categoryTotals['종신'] += amount;
      } else if (cat.includes('자동차') || cat.includes('운전자')) {
        categoryTotals['자동차'] += amount;
      } else {
        categoryTotals['기타'] += amount;
      }
    });

    let score = 70; // 기본 점수
    const strengths: string[] = [];
    const improvements: string[] = [];
    const costSavingTips: string[] = [];
    const categoryEvaluations: CategoryEvaluation[] = [];

    // 1. 실손 평가
    const hasSilson = categoryTotals['실손'] > 0;
    if (hasSilson) {
      score += 15;
      strengths.push(
        '가장 필수적인 실손의료비 보장을 안정적으로 유지하고 있습니다.',
      );
      categoryEvaluations.push({
        category: '실손의료비',
        status: 'ADEQUATE',
        currentAmount: categoryTotals['실손'],
        recommendedAmount: 50000000,
        comment:
          '일상 의료비와 통원/입원비에 대한 탄탄한 안전망이 구축되어 있습니다.',
      });
    } else {
      score -= 25;
      improvements.push(
        '필수 기본 보장인 단독 실손의료비 보험이 없습니다. 최우선 가입을 권장합니다.',
      );
      categoryEvaluations.push({
        category: '실손의료비',
        status: 'NOT_COVERED',
        currentAmount: 0,
        recommendedAmount: 50000000,
        comment:
          '실손 미가입 상태로, 질병 및 상해 발생 시 자기부담금 리스크가 큽니다.',
      });
    }

    // 2. 암/건강 평가
    const cancerAmount = categoryTotals['암/건강'];
    if (cancerAmount >= 50000000) {
      score += 10;
      strengths.push(
        `암 및 주요 성인병 진단비가 ${Math.round(cancerAmount / 10000).toLocaleString()}만원으로 든든하게 구성되었습니다.`,
      );
      categoryEvaluations.push({
        category: '암/3대질병',
        status: cancerAmount > 150000000 ? 'OVER_COVERED' : 'ADEQUATE',
        currentAmount: cancerAmount,
        recommendedAmount: 50000000,
        comment:
          cancerAmount > 150000000
            ? '보장금액이 매우 높으나 월 납입료 부담 여부를 점검할 필요가 있습니다.'
            : '3대 주요 성인병 발병 시 치료비와 생활비를 충분히 감당할 수 있는 수준입니다.',
      });
    } else if (cancerAmount > 0) {
      improvements.push(
        '암/뇌/심장 주요 진단비가 표준 권장(5천만원) 대비 다소 부족합니다. 비갱신 특약 추가를 고려해보세요.',
      );
      categoryEvaluations.push({
        category: '암/3대질병',
        status: 'UNDER_COVERED',
        currentAmount: cancerAmount,
        recommendedAmount: 50000000,
        comment:
          '기본 보장은 있으나 고액 치료비 소요 시 추가 보장 보완이 권장됩니다.',
      });
    } else {
      score -= 15;
      improvements.push(
        '암, 뇌혈관, 허혈성 심장질환 등 3대 진단비 보장이 전무합니다.',
      );
      categoryEvaluations.push({
        category: '암/3대질병',
        status: 'NOT_COVERED',
        currentAmount: 0,
        recommendedAmount: 50000000,
        comment:
          '중대 질환에 대한 대비가 없어 갑작스러운 진단 시 큰 경제적 부담이 될 수 있습니다.',
      });
    }

    // 3. 종신/사망 평가
    const lifeAmount = categoryTotals['종신'];
    if (lifeAmount > 0) {
      strengths.push(
        '가족을 위한 유고 시 소득 대체 자금(사망 보장)이 마련되어 있습니다.',
      );
      categoryEvaluations.push({
        category: '사망/종신',
        status: 'ADEQUATE',
        currentAmount: lifeAmount,
        recommendedAmount: 100000000,
        comment:
          '유사시 유가족의 생활 안정을 위한 든든한 대비가 되어 있습니다.',
      });
    } else {
      categoryEvaluations.push({
        category: '사망/종신',
        status: 'UNDER_COVERED',
        currentAmount: 0,
        recommendedAmount: 100000000,
        comment:
          '가장(주소득자)인 경우 정기보험 등을 통해 경제 활동기 동안의 사망 보완을 검토하세요.',
      });
    }

    // 4. 자동차/운전자 평가
    const autoAmount = categoryTotals['자동차'];
    if (autoAmount > 0) {
      strengths.push(
        '운전 중 발생 가능한 법적/형사적 리스크(운전자 보장)가 잘 갖춰져 있습니다.',
      );
      categoryEvaluations.push({
        category: '자동차/운전자',
        status: 'ADEQUATE',
        currentAmount: autoAmount,
        recommendedAmount: 30000000,
        comment:
          '운전자 벌금 및 변호사 선임비용 등 필수 담보가 잘 관리되고 있습니다.',
      });
    }

    // 5. 월 납입료 및 절감 팁 평가
    if (totalMonthlyPayment > 300000) {
      score -= 10;
      improvements.push(
        `월 총 납입료가 ${totalMonthlyPayment.toLocaleString()}원으로 가계 지출 대비 다소 높을 수 있습니다.`,
      );
      costSavingTips.push(
        '중복 가입된 입원일당이나 통원특약을 정리하면 월 2~3만원 상당의 보험료를 줄일 수 있습니다.',
      );
      costSavingTips.push(
        '갱신 주기가 짧은 갱신형 담보를 비갱신형으로 전환하거나 감액 완납을 검토해보세요.',
      );
    } else if (totalMonthlyPayment < 50000) {
      costSavingTips.push(
        '현재 매우 경제적인 보험료를 유지 중이며, 필수 실손과 진단비 위주로 가성비 플랜을 유지하세요.',
      );
    } else {
      costSavingTips.push(
        '월 납입료가 적정 가이드라인 내에서 균형 있게 유지되고 있습니다.',
      );
    }

    // 점수 보정 (0 ~ 100)
    score = Math.max(20, Math.min(95, score));
    const grade = this.scoreToGrade(score);

    let summary = '';
    if (score >= 85) {
      summary =
        '주요 위험에 대한 보장과 실손의료비가 매우 균형 있게 설계된 훌륭한 포트폴리오입니다.';
    } else if (score >= 70) {
      summary =
        '필수적인 기초 보장을 잘 갖추고 있으나, 특정 고액 질환에 대한 한도 보강이 일부 필요합니다.';
    } else if (score >= 50) {
      summary =
        '일부 보장이 누락되어 있거나 월 납입료 대비 효율이 떨어져 리모델링 검토가 권장됩니다.';
    } else {
      summary =
        '필수 실손의료비 또는 3대 진단비가 부족하여 긴급한 보장 재설계가 필요합니다.';
    }

    return {
      score,
      grade,
      summary,
      totalMonthlyPayment,
      totalCoverageAmount,
      categoryEvaluations,
      strengths: strengths.slice(0, 3),
      improvements: improvements.slice(0, 3),
      costSavingTips: costSavingTips.slice(0, 2),
      generatedAt: new Date().toISOString(),
      isFallback: true,
    };
  }

  /**
   * 보험 데이터가 없을 때의 Empty 진단 결과
   */
  private generateEmptyDiagnosis(): InsuranceDiagnosisDto {
    return {
      score: 0,
      grade: 'WARNING',
      summary:
        '등록된 보험 상품이 없습니다. 보장 분석을 위해 보험을 등록해주세요.',
      totalMonthlyPayment: 0,
      totalCoverageAmount: 0,
      categoryEvaluations: STANDARD_RECOMMENDATIONS.map((std) => ({
        category: std.category,
        status: 'NOT_COVERED',
        currentAmount: 0,
        recommendedAmount: std.recommendedAmount,
        comment: `${std.description} (미가입)`,
      })),
      strengths: [],
      improvements: [
        '가장 필수적인 실손의료비 보험 등록 또는 가입이 필요합니다.',
        '암, 뇌혈관, 심장질환 3대 성인병 진단비를 최우선으로 준비하세요.',
      ],
      costSavingTips: [
        '단독 실손보험과 비갱신 3대 질병 플랜을 조합하면 가성비 있게 구성할 수 있습니다.',
      ],
      generatedAt: new Date().toISOString(),
      isFallback: true,
    };
  }

  private scoreToGrade(score: number): DiagnosisGrade {
    if (score >= 85) return 'EXCELLENT';
    if (score >= 70) return 'GOOD';
    if (score >= 55) return 'NORMAL';
    if (score >= 40) return 'NEEDS_ATTENTION';
    return 'WARNING';
  }

  private validateGrade(grade: any, score: number): DiagnosisGrade {
    const validGrades: DiagnosisGrade[] = [
      'EXCELLENT',
      'GOOD',
      'NORMAL',
      'NEEDS_ATTENTION',
      'WARNING',
    ];
    if (
      typeof grade === 'string' &&
      validGrades.includes(grade as DiagnosisGrade)
    ) {
      return grade as DiagnosisGrade;
    }
    return this.scoreToGrade(score || 70);
  }
}
