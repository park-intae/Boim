import { Test, TestingModule } from '@nestjs/testing';
import { ExportService } from './export.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiDiagnosisService } from './ai-diagnosis.service';
import * as ExcelJS from 'exceljs';
import type { InsuranceDiagnosisDto } from '@boim/shared-types';

describe('ExportService', () => {
  let service: ExportService;

  const mockPrismaService = {
    insuranceProduct: {
      findMany: jest.fn(),
    },
  };

  const mockDiagnosis: InsuranceDiagnosisDto = {
    score: 85,
    grade: 'GOOD',
    summary: '균형 잡힌 보험 포트폴리오입니다.',
    totalMonthlyPayment: 120000,
    totalCoverageAmount: 150000000,
    categoryEvaluations: [
      {
        category: '실손',
        status: 'ADEQUATE',
        currentAmount: 50000000,
        recommendedAmount: 50000000,
        comment: '실손의료비 충족',
      },
      {
        category: '암/건강',
        status: 'ADEQUATE',
        currentAmount: 50000000,
        recommendedAmount: 50000000,
        comment: '3대 질병 충분',
      },
    ],
    strengths: ['실손 보장 완비', '암 진단비 확보'],
    improvements: ['뇌혈관 보장 보완 권장'],
    costSavingTips: ['중복 특약 점검'],
    generatedAt: new Date().toISOString(),
    isFallback: false,
  };

  const mockAiDiagnosisService = {
    diagnoseUserInsurances: jest.fn().mockResolvedValue(mockDiagnosis),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AiDiagnosisService,
          useValue: mockAiDiagnosisService,
        },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
    jest.clearAllMocks();
  });

  it('서비스가 정상적으로 정의되어 있어야 한다.', () => {
    expect(service).toBeDefined();
  });

  describe('generateExcelReport', () => {
    it('가입 보험 데이터가 있을 때 3개 시트를 포함하는 유효한 엑셀 버퍼를 생성해야 한다.', async () => {
      const mockProducts = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          institution: '삼성화재',
          name: '무배당 실손의료비보험',
          category: '실손',
          monthlyPayment: 30000,
          coverageAmount: BigInt(50000000),
          startDate: new Date('2024-01-01'),
          maturityDate: new Date('2044-01-01'),
        },
        {
          id: BigInt(2),
          userId: BigInt(1),
          institution: '현대해상',
          name: '굿앤굿 암보험',
          category: '암/건강',
          monthlyPayment: 90000,
          coverageAmount: BigInt(50000000),
          startDate: new Date('2024-02-01'),
          maturityDate: new Date('2054-02-01'),
        },
      ];

      mockPrismaService.insuranceProduct.findMany.mockResolvedValueOnce(
        mockProducts,
      );

      const buffer = await service.generateExcelReport(BigInt(1));

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // 생성된 엑셀 버퍼를 ExcelJS Workbook으로 복원하여 시트 구조 검증
      const loadedWorkbook = new ExcelJS.Workbook();
      await loadedWorkbook.xlsx.load(buffer);

      expect(loadedWorkbook.worksheets.length).toBe(3);
      expect(loadedWorkbook.getWorksheet('가입 보험 상세')).toBeDefined();
      expect(loadedWorkbook.getWorksheet('카테고리별 통계')).toBeDefined();
      expect(loadedWorkbook.getWorksheet('AI 종합 진단')).toBeDefined();

      // 시트 1 검증
      const detailSheet = loadedWorkbook.getWorksheet('가입 보험 상세')!;
      expect(detailSheet.rowCount).toBeGreaterThanOrEqual(3); // 헤더 + 2개 데이터 + 합계

      // 시트 3 검증
      const diagSheet = loadedWorkbook.getWorksheet('AI 종합 진단')!;
      expect(diagSheet.getCell('A1').value).toBe(
        'Boim 내 보험 AI 종합 진단 리포트',
      );
    });

    it('가입 보험이 없을 때도 에러 없이 빈 상태의 엑셀 버퍼를 정상 반환해야 한다.', async () => {
      mockPrismaService.insuranceProduct.findMany.mockResolvedValueOnce([]);

      const buffer = await service.generateExcelReport(BigInt(1));

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      const loadedWorkbook = new ExcelJS.Workbook();
      await loadedWorkbook.xlsx.load(buffer);

      expect(loadedWorkbook.worksheets.length).toBe(3);
      const detailSheet = loadedWorkbook.getWorksheet('가입 보험 상세')!;
      expect(detailSheet.getCell('B2').value).toBe(
        '등록된 보험 상품이 없습니다.',
      );
    });
  });
});
