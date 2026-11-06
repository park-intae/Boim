import { Test, TestingModule } from '@nestjs/testing';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AiDiagnosisService', () => {
  let service: AiDiagnosisService;

  const mockPrismaService = {
    insuranceProduct: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiDiagnosisService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AiDiagnosisService>(AiDiagnosisService);
    jest.clearAllMocks();
  });

  it('서비스가 정상적으로 정의되어 있어야 한다.', () => {
    expect(service).toBeDefined();
  });

  describe('diagnoseUserInsurances - 가입 보험이 없는 경우 (Empty State)', () => {
    it('보험이 0건일 때 score 0, WARNING 등급 및 미가입 안내를 반환해야 한다.', async () => {
      mockPrismaService.insuranceProduct.findMany.mockResolvedValueOnce([]);

      const result = await service.diagnoseUserInsurances(BigInt(1));

      expect(result.score).toBe(0);
      expect(result.grade).toBe('WARNING');
      expect(result.isFallback).toBe(true);
      expect(result.summary).toContain('등록된 보험 상품이 없습니다');
      expect(result.categoryEvaluations.length).toBeGreaterThan(0);
      expect(
        result.categoryEvaluations.every((c) => c.status === 'NOT_COVERED'),
      ).toBe(true);
    });
  });

  describe('diagnoseUserInsurances - 규칙 기반(Rule-based) 폴백 진단', () => {
    it('실손과 암보험이 정상적으로 구성된 경우 높은 점수와 긍정적 평가를 반환해야 한다.', async () => {
      const mockProducts = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          category: '실손의료비',
          name: '착한실손의료비보험',
          institution: '삼성화재',
          monthlyPayment: 25000,
          coverageAmount: BigInt(50000000),
          startDate: new Date('2024-01-01'),
          maturityDate: new Date('2044-01-01'),
        },
        {
          id: BigInt(2),
          userId: BigInt(1),
          category: '암/건강',
          name: '올인원 암보험',
          institution: '현대해상',
          monthlyPayment: 60000,
          coverageAmount: BigInt(50000000),
          startDate: new Date('2024-02-01'),
          maturityDate: new Date('2054-02-01'),
        },
      ];

      mockPrismaService.insuranceProduct.findMany.mockResolvedValueOnce(
        mockProducts,
      );

      const result = await service.diagnoseUserInsurances(BigInt(1));

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.grade).toMatch(/EXCELLENT|GOOD/);
      expect(result.totalMonthlyPayment).toBe(85000);
      expect(result.totalCoverageAmount).toBe(100000000);
      expect(result.strengths.length).toBeGreaterThan(0);
      expect(result.isFallback).toBe(true);

      const silsonEval = result.categoryEvaluations.find(
        (c) => c.category === '실손의료비',
      );
      expect(silsonEval).toBeDefined();
      expect(silsonEval?.status).toBe('ADEQUATE');
    });

    it('실손이 없고 납입료가 30만원을 초과하는 경우 감점 및 절감 팁을 반환해야 한다.', async () => {
      const mockProducts = [
        {
          id: BigInt(3),
          userId: BigInt(1),
          category: '기타/특약',
          name: '비싼특약보험',
          institution: 'A생명',
          monthlyPayment: 350000,
          coverageAmount: BigInt(10000000),
          startDate: new Date('2024-01-01'),
          maturityDate: new Date('2034-01-01'),
        },
      ];

      mockPrismaService.insuranceProduct.findMany.mockResolvedValueOnce(
        mockProducts,
      );

      const result = await service.diagnoseUserInsurances(BigInt(1));

      expect(result.score).toBeLessThanOrEqual(60);
      expect(result.improvements.some((imp) => imp.includes('실손'))).toBe(
        true,
      );
      expect(result.costSavingTips.length).toBeGreaterThan(0);

      const silsonEval = result.categoryEvaluations.find(
        (c) => c.category === '실손의료비',
      );
      expect(silsonEval?.status).toBe('NOT_COVERED');
    });
  });

  describe('executeGeminiDiagnosis - AI 클라이언트 모의 연동', () => {
    it('Gemini AI가 유효한 JSON을 반환하면 AI 진단 결과(isFallback: false)를 반환해야 한다.', async () => {
      const mockProducts = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          category: '실손',
          name: '모의실손',
          institution: '삼성화재',
          monthlyPayment: 30000,
          coverageAmount: BigInt(50000000),
          startDate: new Date('2024-01-01'),
          maturityDate: new Date('2044-01-01'),
        },
      ];

      mockPrismaService.insuranceProduct.findMany.mockResolvedValueOnce(
        mockProducts,
      );

      const aiMockResponse = {
        score: 92,
        grade: 'EXCELLENT',
        summary: 'AI 분석 결과 매우 훌륭합니다.',
        categoryEvaluations: [
          {
            category: '실손',
            status: 'ADEQUATE',
            currentAmount: 50000000,
            recommendedAmount: 50000000,
            comment: '실손 완벽',
          },
        ],
        strengths: ['AI 분석 강점 1'],
        improvements: ['AI 분석 보완점 1'],
        costSavingTips: ['AI 분석 절감팁 1'],
      };

      // aiClient 모킹 주입
      (service as any).aiClient = {
        models: {
          generateContent: jest.fn().mockResolvedValueOnce({
            text: JSON.stringify(aiMockResponse),
          }),
        },
      };

      const result = await service.diagnoseUserInsurances(BigInt(1));

      expect(result.score).toBe(92);
      expect(result.grade).toBe('EXCELLENT');
      expect(result.summary).toBe('AI 분석 결과 매우 훌륭합니다.');
      expect(result.isFallback).toBe(false);
      expect(result.strengths).toContain('AI 분석 강점 1');
    });

    it('Gemini AI 호출 중 오류 발생 시 규칙 기반 폴백 엔진으로 안전하게 전환되어야 한다.', async () => {
      const mockProducts = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          category: '실손',
          name: '모의실손',
          institution: '삼성화재',
          monthlyPayment: 30000,
          coverageAmount: BigInt(50000000),
          startDate: new Date('2024-01-01'),
          maturityDate: new Date('2044-01-01'),
        },
      ];

      mockPrismaService.insuranceProduct.findMany.mockResolvedValueOnce(
        mockProducts,
      );

      (service as any).aiClient = {
        models: {
          generateContent: jest
            .fn()
            .mockRejectedValueOnce(new Error('Gemini API Quota Exceeded')),
        },
      };

      const result = await service.diagnoseUserInsurances(BigInt(1));

      expect(result).toBeDefined();
      expect(result.isFallback).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });
  });
});
