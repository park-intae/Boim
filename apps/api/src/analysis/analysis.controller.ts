import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiProduces,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { ExportService } from './export.service';
import type { RequestWithJwtUser } from '../auth/auth.controller';
import type { InsuranceDiagnosisDto } from '@boim/shared-types';

@ApiTags('Analysis (보험 분석 & AI 종합 진단)')
@ApiBearerAuth()
@Controller('analysis')
@UseGuards(AuthGuard('jwt'))
export class AnalysisController {
  constructor(
    private readonly aiDiagnosisService: AiDiagnosisService,
    private readonly exportService: ExportService,
  ) {}

  private extractUserId(req?: RequestWithJwtUser): bigint {
    if (!req?.user?.userId) {
      throw new UnauthorizedException('인증 정보가 필요합니다.');
    }
    return BigInt(req.user.userId);
  }

  @Post('ai-diagnosis')
  @ApiOperation({
    summary: '내 보험 현황 Gemini AI 종합 진단 실행',
    description:
      '가입된 보험의 보장 내역을 종합 분석하여 점수, 과다/부족 판정, 1:1 리모델링 조언을 반환합니다.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'AI 종합 진단 완료',
  })
  async generateDiagnosis(
    @Req() req: RequestWithJwtUser,
  ): Promise<InsuranceDiagnosisDto> {
    const userId = this.extractUserId(req);
    return this.aiDiagnosisService.diagnoseUserInsurances(userId, true);
  }

  @Get('ai-diagnosis')
  @ApiOperation({
    summary: '최신 AI 종합 진단 결과 조회 (GET)',
    description:
      '기존 진단 데이터를 조회하거나 신규 분석을 실행하여 결과를 반환합니다.',
  })
  async getDiagnosis(
    @Req() req: RequestWithJwtUser,
  ): Promise<InsuranceDiagnosisDto> {
    const userId = this.extractUserId(req);
    return this.aiDiagnosisService.diagnoseUserInsurances(userId, false);
  }

  @Get('export/excel')
  @ApiOperation({
    summary: '내 보험 포트폴리오 및 AI 진단 리포트 Excel(XLSX) 다운로드',
    description:
      '가입 보험 상세 목록, 카테고리별 통계, AI 종합 진단 결과가 포함된 엑셀 파일을 다운로드합니다.',
  })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportExcel(
    @Req() req: RequestWithJwtUser,
    @Res() res: Response,
  ): Promise<void> {
    const userId = this.extractUserId(req);
    const buffer = await this.exportService.generateExcelReport(userId);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const filename = `boim_insurance_report_${dateStr}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }
}
