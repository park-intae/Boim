import type { InsuranceDiagnosisDto } from '@boim/shared-types';

export const mockDiagnosisData: InsuranceDiagnosisDto = {
  score: 82,
  grade: 'GOOD',
  summary: '전반적인 3대 질병 보장과 실손의료비가 탄탄하게 준비되어 있으나, 뇌혈관 질환 보장이 다소 부족합니다.',
  totalMonthlyPayment: 213000,
  totalCoverageAmount: 130000000,
  categoryEvaluations: [
    {
      category: '암',
      status: 'ADEQUATE',
      currentAmount: 50000000,
      recommendedAmount: 50000000,
      comment: '진단비 및 수술비 보장이 충분합니다.',
    },
    {
      category: '뇌혈관',
      status: 'UNDER_COVERED',
      currentAmount: 10000000,
      recommendedAmount: 30000000,
      comment: '허혈성 심장질환 및 뇌혈관 보장 확대가 권장됩니다.',
    },
    {
      category: '실손',
      status: 'ADEQUATE',
      currentAmount: 50000000,
      recommendedAmount: 50000000,
      comment: '기본 의료비 지출에 충분히 대비되어 있습니다.',
    },
  ],
  strengths: ['암 진단비가 충분하게 구성되어 있습니다.', '실손의료비가 빈틈없이 준비되었습니다.'],
  improvements: ['뇌혈관/허혈성 심질환 진단비를 보강하는 것이 좋습니다.'],
  costSavingTips: ['동일 보장의 다이렉트 상품과 비교하여 월 1~2만원 절감을 검토해보세요.'],
  generatedAt: '2026-11-10T09:00:00.000Z',
  isFallback: false,
};
