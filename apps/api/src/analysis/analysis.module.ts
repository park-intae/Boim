import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { ExportService } from './export.service';
import { AnalysisController } from './analysis.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AnalysisController],
  providers: [AiDiagnosisService, ExportService],
  exports: [AiDiagnosisService, ExportService],
})
export class AnalysisModule {}
