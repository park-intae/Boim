import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Query,
} from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import type { RequestWithJwtUser } from '../auth/auth.controller';
import * as multer from 'multer';

@Controller('documents')
@UseGuards(OptionalJwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('sample/preset')
  getSamplePreset() {
    return this.documentService.getSamplePreset();
  }

  @Post('sample/parse')
  async parseSampleDocument() {
    return this.documentService.parseSampleDocument();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 30 * 1024 * 1024 }, // 30MB 고화질 스마트폰 사진 대응
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithJwtUser,
    @Query('productId') productId?: string,
  ) {
    const userId = BigInt(req.user?.userId || '1');
    return this.documentService.uploadDocument(
      userId,
      file,
      productId ? BigInt(productId) : undefined,
    );
  }

  @Post(':id/parse')
  async parseDocument(@Param('id') id: string, @Req() req: RequestWithJwtUser) {
    const userId = BigInt(req.user?.userId || '1');
    return this.documentService.parseDocument(userId, BigInt(id));
  }

  @Get()
  async getUserDocuments(@Req() req: RequestWithJwtUser) {
    const userId = BigInt(req.user?.userId || '1');
    return this.documentService.getUserDocuments(userId);
  }

  @Get(':id')
  async getDocument(@Param('id') id: string, @Req() req: RequestWithJwtUser) {
    const userId = BigInt(req.user?.userId || '1');
    return this.documentService.getDocument(userId, BigInt(id));
  }

  @Delete(':id')
  async deleteDocument(
    @Param('id') id: string,
    @Req() req: RequestWithJwtUser,
  ) {
    const userId = BigInt(req.user?.userId || '1');
    return this.documentService.deleteDocument(userId, BigInt(id));
  }
}
