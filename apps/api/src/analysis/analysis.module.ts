import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { AnalysisController } from './analysis.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AnalysisController],
  providers: [AiDiagnosisService],
  exports: [AiDiagnosisService],
})
export class AnalysisModule {}
