import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentParserService } from './document-parser.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentParserService],
  exports: [DocumentService, DocumentParserService],
})
export class DocumentModule {}
