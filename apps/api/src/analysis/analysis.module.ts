import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { ExportService } from './export.service';
import { AnalysisController } from './analysis.controller';
import { RuleBasedDiagnosisEngine } from './rule-based-diagnosis.engine';

@Module({
  imports: [PrismaModule],
  controllers: [AnalysisController],
  providers: [AiDiagnosisService, ExportService, RuleBasedDiagnosisEngine],
  exports: [AiDiagnosisService, ExportService, RuleBasedDiagnosisEngine],
})
export class AnalysisModule {}
