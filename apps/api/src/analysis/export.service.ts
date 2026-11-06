import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiDiagnosisService } from './ai-diagnosis.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiDiagnosisService: AiDiagnosisService,
  ) {}

  /**
   * 사용자의 가입 보험 상세, 카테고리별 통계, AI 종합 진단 결과가 포함된 엑셀(.xlsx) 버퍼 생성
   * @param userId 사용자 ID
   */
  async generateExcelReport(userId: bigint): Promise<Buffer> {
    const products = await this.prisma.insuranceProduct.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const diagnosis =
      await this.aiDiagnosisService.diagnoseUserInsurances(userId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Boim - 개인 보험 관리 서비스';
    workbook.created = new Date();

    // 1. 첫 번째 시트: 가입 보험 상세 목록
    this.createInsuranceListSheet(workbook, products);

    // 2. 두 번째 시트: 카테고리별 통계 및 납입 요약
    this.createCategoryStatsSheet(workbook, products);

    // 3. 세 번째 시트: AI 종합 진단 리포트 요약
    this.createAiDiagnosisSheet(workbook, diagnosis);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * 시트 1: 내 보험 가입 목록
   */
  private createInsuranceListSheet(
    workbook: ExcelJS.Workbook,
    products: any[],
  ) {
    const sheet = workbook.addWorksheet('가입 보험 상세', {
      views: [{ showGridLines: true }],
    });

    sheet.columns = [
      { header: 'No', key: 'no', width: 8 },
      { header: '보험사', key: 'institution', width: 16 },
      { header: '보험 상품명', key: 'name', width: 32 },
      { header: '카테고리', key: 'category', width: 14 },
      { header: '월 납입액', key: 'monthlyPayment', width: 18 },
      { header: '보장금액', key: 'coverageAmount', width: 22 },
      { header: '가입일', key: 'startDate', width: 14 },
      { header: '만기일', key: 'maturityDate', width: 14 },
    ];

    // 헤더 스타일링
    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }, // Indigo-600
      };
      cell.font = {
        name: 'Malgun Gothic',
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 11,
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'medium', color: { argb: 'FF3730A3' } },
      };
    });

    if (products.length === 0) {
      sheet.addRow([
        '',
        '등록된 보험 상품이 없습니다.',
        '',
        '',
        '',
        '',
        '',
        '',
      ]);
      const emptyRow = sheet.getRow(2);
      emptyRow.height = 25;
      emptyRow.getCell(2).font = { italic: true, color: { argb: 'FF999999' } };
      return;
    }

    products.forEach((p, idx) => {
      const row = sheet.addRow({
        no: idx + 1,
        institution: p.institution,
        name: p.name,
        category: p.category,
        monthlyPayment: p.monthlyPayment,
        coverageAmount: Number(p.coverageAmount),
        startDate: p.startDate
          ? new Date(p.startDate).toISOString().split('T')[0]
          : '-',
        maturityDate: p.maturityDate
          ? new Date(p.maturityDate).toISOString().split('T')[0]
          : '-',
      });

      row.height = 22;
      row.getCell('no').alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      row.getCell('institution').alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      row.getCell('name').alignment = {
        vertical: 'middle',
        horizontal: 'left',
      };
      row.getCell('category').alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };

      const paymentCell = row.getCell('monthlyPayment');
      paymentCell.numFmt = '#,##0"원"';
      paymentCell.alignment = { vertical: 'middle', horizontal: 'right' };

      const coverageCell = row.getCell('coverageAmount');
      coverageCell.numFmt = '#,##0"원"';
      coverageCell.alignment = { vertical: 'middle', horizontal: 'right' };

      row.getCell('startDate').alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      row.getCell('maturityDate').alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };

      row.eachCell((cell) => {
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    });

    // 합계 행
    const totalPayment = products.reduce(
      (acc, curr) => acc + (curr.monthlyPayment || 0),
      0,
    );
    const totalCoverage = products.reduce(
      (acc, curr) => acc + Number(curr.coverageAmount || 0),
      0,
    );

    const summaryRow = sheet.addRow({
      no: '',
      institution: '합계',
      name: `총 ${products.length}건`,
      category: '',
      monthlyPayment: totalPayment,
      coverageAmount: totalCoverage,
      startDate: '',
      maturityDate: '',
    });

    summaryRow.height = 26;
    summaryRow.eachCell((cell) => {
      cell.font = { bold: true, name: 'Malgun Gothic' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
        bottom: { style: 'double', color: { argb: 'FF9CA3AF' } },
      };
    });
    summaryRow.getCell('monthlyPayment').numFmt = '#,##0"원"';
    summaryRow.getCell('coverageAmount').numFmt = '#,##0"원"';
  }

  /**
   * 시트 2: 카테고리별 통계 및 납입 요약
   */
  private createCategoryStatsSheet(
    workbook: ExcelJS.Workbook,
    products: any[],
  ) {
    const sheet = workbook.addWorksheet('카테고리별 통계', {
      views: [{ showGridLines: true }],
    });

    sheet.columns = [
      { header: '카테고리', key: 'category', width: 18 },
      { header: '가입 건수', key: 'count', width: 14 },
      { header: '월 납입액 합계', key: 'monthlyPayment', width: 22 },
      { header: '총 보장금액', key: 'coverageAmount', width: 24 },
      { header: '납입 비중', key: 'ratio', width: 14 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF10B981' }, // Emerald-500
      };
      cell.font = {
        name: 'Malgun Gothic',
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 11,
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    const categoryMap: Record<
      string,
      { count: number; payment: number; coverage: number }
    > = {};
    const totalPayment = products.reduce(
      (acc, curr) => acc + (curr.monthlyPayment || 0),
      0,
    );

    products.forEach((p) => {
      const cat = p.category || '기타';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, payment: 0, coverage: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].payment += p.monthlyPayment || 0;
      categoryMap[cat].coverage += Number(p.coverageAmount || 0);
    });

    Object.entries(categoryMap).forEach(([cat, stat]) => {
      const ratio = totalPayment > 0 ? stat.payment / totalPayment : 0;
      const row = sheet.addRow({
        category: cat,
        count: `${stat.count}건`,
        monthlyPayment: stat.payment,
        coverageAmount: stat.coverage,
        ratio: ratio,
      });

      row.height = 22;
      row.getCell('category').alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      row.getCell('count').alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };

      const payCell = row.getCell('monthlyPayment');
      payCell.numFmt = '#,##0"원"';
      payCell.alignment = { vertical: 'middle', horizontal: 'right' };

      const covCell = row.getCell('coverageAmount');
      covCell.numFmt = '#,##0"원"';
      covCell.alignment = { vertical: 'middle', horizontal: 'right' };

      const ratioCell = row.getCell('ratio');
      ratioCell.numFmt = '0.0%';
      ratioCell.alignment = { vertical: 'middle', horizontal: 'right' };

      row.eachCell((cell) => {
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    });
  }

  /**
   * 시트 3: AI 종합 진단 리포트 요약
   */
  private createAiDiagnosisSheet(workbook: ExcelJS.Workbook, diagnosis: any) {
    const sheet = workbook.addWorksheet('AI 종합 진단', {
      views: [{ showGridLines: true }],
    });

    sheet.getColumn(1).width = 20;
    sheet.getColumn(2).width = 60;

    // 타이틀
    const titleRow = sheet.addRow(['Boim 내 보험 AI 종합 진단 리포트', '']);
    titleRow.height = 32;
    titleRow.getCell(1).font = {
      name: 'Malgun Gothic',
      size: 14,
      bold: true,
      color: { argb: 'FF1F2937' },
    };

    // 종합 정보
    sheet.addRow([
      '진단 생성일시',
      diagnosis.generatedAt
        ? new Date(diagnosis.generatedAt).toLocaleString('ko-KR')
        : '-',
    ]);
    sheet.addRow([
      '종합 점수',
      `${diagnosis.score}점 / 100점 (등급: ${diagnosis.grade})`,
    ]);
    sheet.addRow([
      '총 월 납입 보험료',
      `${(diagnosis.totalMonthlyPayment || 0).toLocaleString()}원`,
    ]);
    sheet.addRow([
      '총 보장금액 합계',
      `${(diagnosis.totalCoverageAmount || 0).toLocaleString()}원`,
    ]);
    sheet.addRow(['종합 한줄평', diagnosis.summary || '-']);
    sheet.addRow(['', '']);

    // 서브 섹션: 카테고리별 평가
    const catHeader = sheet.addRow(['카테고리별 보장 적정도', '']);
    catHeader.getCell(1).font = {
      bold: true,
      size: 12,
      color: { argb: 'FF4F46E5' },
    };

    if (Array.isArray(diagnosis.categoryEvaluations)) {
      diagnosis.categoryEvaluations.forEach((item: any) => {
        sheet.addRow([
          `• ${item.category}`,
          `[${item.status}] 현재: ${(item.currentAmount || 0).toLocaleString()}원 / 권장: ${(item.recommendedAmount || 0).toLocaleString()}원 - ${item.comment}`,
        ]);
      });
    }

    sheet.addRow(['', '']);

    // 강점
    const strHeader = sheet.addRow(['잘 설계된 보장 (강점)', '']);
    strHeader.getCell(1).font = {
      bold: true,
      size: 12,
      color: { argb: 'FF10B981' },
    };
    if (Array.isArray(diagnosis.strengths)) {
      diagnosis.strengths.forEach((str: string) => {
        sheet.addRow(['', `✓ ${str}`]);
      });
    }

    sheet.addRow(['', '']);

    // 보완점
    const impHeader = sheet.addRow(['보완이 필요한 항목', '']);
    impHeader.getCell(1).font = {
      bold: true,
      size: 12,
      color: { argb: 'FFEF4444' },
    };
    if (Array.isArray(diagnosis.improvements)) {
      diagnosis.improvements.forEach((imp: string) => {
        sheet.addRow(['', `! ${imp}`]);
      });
    }

    sheet.addRow(['', '']);

    // 절감 팁
    const tipHeader = sheet.addRow(['월 보험료 절감 팁', '']);
    tipHeader.getCell(1).font = {
      bold: true,
      size: 12,
      color: { argb: 'FFF59E0B' },
    };
    if (Array.isArray(diagnosis.costSavingTips)) {
      diagnosis.costSavingTips.forEach((tip: string) => {
        sheet.addRow(['', `💡 ${tip}`]);
      });
    }
  }
}
