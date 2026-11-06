import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisController } from './analysis.controller';
import { AiDiagnosisService } from './ai-diagnosis.service';
import type { InsuranceDiagnosisDto } from '@boim/shared-types';

describe('AnalysisController', () => {
  let controller: AnalysisController;

  const mockDiagnosisResult: InsuranceDiagnosisDto = {
    score: 85,
    grade: 'GOOD',
    summary: '종합 진단 요약',
    totalMonthlyPayment: 100000,
    totalCoverageAmount: 100000000,
    categoryEvaluations: [],
    strengths: ['강점 1'],
    improvements: ['보완점 1'],
    costSavingTips: ['절감팁 1'],
    generatedAt: new Date().toISOString(),
    isFallback: false,
  };

  const mockAiDiagnosisService = {
    diagnoseUserInsurances: jest.fn().mockResolvedValue(mockDiagnosisResult),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalysisController],
      providers: [
        {
          provide: AiDiagnosisService,
          useValue: mockAiDiagnosisService,
        },
      ],
    }).compile();

    controller = module.get<AnalysisController>(AnalysisController);
    jest.clearAllMocks();
  });

  it('컨트롤러가 정상적으로 정의되어 있어야 한다.', () => {
    expect(controller).toBeDefined();
  });

  describe('generateDiagnosis (POST /analysis/ai-diagnosis)', () => {
    it('인증된 사용자의 userId를 전달하여 AI 종합 진단을 실행하고 결과를 반환해야 한다.', async () => {
      const mockReq = {
        user: { userId: '10', email: 'user@boim.com' },
      } as any;

      const result = await controller.generateDiagnosis(mockReq);

      expect(result).toEqual(mockDiagnosisResult);
      expect(
        mockAiDiagnosisService.diagnoseUserInsurances,
      ).toHaveBeenCalledWith(BigInt(10));
    });

    it('인증 정보가 없을 경우 데모 사용자(userId 1)로 기본 처리되어야 한다.', async () => {
      const mockReq = {} as any;

      const result = await controller.generateDiagnosis(mockReq);

      expect(result).toEqual(mockDiagnosisResult);
      expect(
        mockAiDiagnosisService.diagnoseUserInsurances,
      ).toHaveBeenCalledWith(BigInt(1));
    });
  });

  describe('getDiagnosis (GET /analysis/ai-diagnosis)', () => {
    it('GET 요청 시에도 사용자 진단 결과를 정상적으로 반환해야 한다.', async () => {
      const mockReq = {
        user: { userId: '5', email: 'user5@boim.com' },
      } as any;

      const result = await controller.getDiagnosis(mockReq);

      expect(result).toEqual(mockDiagnosisResult);
      expect(
        mockAiDiagnosisService.diagnoseUserInsurances,
      ).toHaveBeenCalledWith(BigInt(5));
    });
  });
});
