import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/auth.controller';
import type { InsuranceDiagnosisDto } from '@boim/shared-types';

@ApiTags('Analysis (보험 분석 & AI 종합 진단)')
@Controller('analysis')
@UseGuards(OptionalJwtAuthGuard)
export class AnalysisController {
  constructor(private readonly aiDiagnosisService: AiDiagnosisService) {}

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
    const userId = BigInt(req.user?.userId || '1');
    return this.aiDiagnosisService.diagnoseUserInsurances(userId);
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
    const userId = BigInt(req.user?.userId || '1');
    return this.aiDiagnosisService.diagnoseUserInsurances(userId);
  }
}
