import { RuleBasedDiagnosisEngine } from './rule-based-diagnosis.engine';

describe('RuleBasedDiagnosisEngine', () => {
  let engine: RuleBasedDiagnosisEngine;

  beforeEach(() => {
    engine = new RuleBasedDiagnosisEngine();
  });

  describe('generateEmptyDiagnosis', () => {
    it('returns score 0 and WARNING grade when no products exist', () => {
      const result = engine.generateEmptyDiagnosis();

      expect(result.score).toBe(0);
      expect(result.grade).toBe('WARNING');
      expect(result.totalMonthlyPayment).toBe(0);
      expect(result.totalCoverageAmount).toBe(0);
      expect(result.isFallback).toBe(true);
      expect(result.categoryEvaluations.length).toBe(4);
      expect(
        result.categoryEvaluations.every((e) => e.status === 'NOT_COVERED'),
      ).toBe(true);
      expect(result.improvements.length).toBeGreaterThan(0);
    });
  });

  describe('generateDiagnosis', () => {
    it('accurately evaluates adequate insurance with silson and cancer coverage', () => {
      const products = [
        {
          id: 1n,
          category: '실손의료비',
          name: '착한실손보험',
          institution: '삼성화재',
          monthlyPayment: 25000,
          coverageAmount: 50000000,
        },
        {
          id: 2n,
          category: '암/건강보험',
          name: '올바른암보험',
          institution: '한화생명',
          monthlyPayment: 55000,
          coverageAmount: 60000000,
        },
      ];

      const result = engine.generateDiagnosis(products);

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.totalMonthlyPayment).toBe(80000);
      expect(result.totalCoverageAmount).toBe(110000000);
      expect(result.isFallback).toBe(true);

      const silson = result.categoryEvaluations.find(
        (e) => e.category === '실손의료비',
      );
      expect(silson?.status).toBe('ADEQUATE');
      expect(silson?.currentAmount).toBe(50000000);

      const cancer = result.categoryEvaluations.find(
        (e) => e.category === '암/3대질병',
      );
      expect(cancer?.status).toBe('ADEQUATE');
      expect(cancer?.currentAmount).toBe(60000000);
    });

    it('penalizes score and marks NOT_COVERED when silson is missing', () => {
      const products = [
        {
          id: 1n,
          category: '종신보험',
          name: '종신플랜',
          institution: '교보생명',
          monthlyPayment: 150000,
          coverageAmount: 100000000,
        },
      ];

      const result = engine.generateDiagnosis(products);

      const silson = result.categoryEvaluations.find(
        (e) => e.category === '실손의료비',
      );
      expect(silson?.status).toBe('NOT_COVERED');
      expect(result.improvements).toEqual(
        expect.arrayContaining([expect.stringContaining('단독 실손의료비')]),
      );
    });

    it('identifies excessive payment when monthly payment exceeds 300,000 KRW', () => {
      const products = [
        {
          id: 1n,
          category: '실손',
          name: '실손',
          monthlyPayment: 200000,
          coverageAmount: 50000000,
        },
        {
          id: 2n,
          category: '종신',
          name: '종신',
          monthlyPayment: 150000,
          coverageAmount: 100000000,
        },
      ];

      const result = engine.generateDiagnosis(products);

      expect(result.totalMonthlyPayment).toBe(350000);
      expect(result.costSavingTips.length).toBeGreaterThan(0);
      expect(result.improvements).toEqual(
        expect.arrayContaining([expect.stringContaining('350,000원')]),
      );
    });
  });

  describe('scoreToGrade & validateGrade', () => {
    it('properly converts scores to grades', () => {
      expect(engine.scoreToGrade(90)).toBe('EXCELLENT');
      expect(engine.scoreToGrade(75)).toBe('GOOD');
      expect(engine.scoreToGrade(60)).toBe('NORMAL');
      expect(engine.scoreToGrade(45)).toBe('NEEDS_ATTENTION');
      expect(engine.scoreToGrade(30)).toBe('WARNING');
    });

    it('validates grade string and falls back on score', () => {
      expect(engine.validateGrade('EXCELLENT', 50)).toBe('EXCELLENT');
      expect(engine.validateGrade('INVALID_GRADE', 80)).toBe('GOOD');
      expect(engine.validateGrade(null, 95)).toBe('EXCELLENT');
    });
  });
});
