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
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import type { RequestWithJwtUser } from '../auth/auth.controller';
import * as multer from 'multer';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  private extractUserId(req?: RequestWithJwtUser): bigint {
    if (!req?.user?.userId) {
      throw new UnauthorizedException('인증 정보가 필요합니다.');
    }
    return BigInt(req.user.userId);
  }

  @Get('sample/preset')
  getSamplePreset() {
    return this.documentService.getSamplePreset();
  }

  @Post('sample/parse')
  async parseSampleDocument() {
    return this.documentService.parseSampleDocument();
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
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
    const userId = this.extractUserId(req);
    return this.documentService.uploadDocument(
      userId,
      file,
      productId ? BigInt(productId) : undefined,
    );
  }

  @Post(':id/parse')
  @UseGuards(AuthGuard('jwt'))
  async parseDocument(@Param('id') id: string, @Req() req: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    return this.documentService.parseDocument(userId, BigInt(id));
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUserDocuments(@Req() req: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    return this.documentService.getUserDocuments(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getDocument(@Param('id') id: string, @Req() req: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    return this.documentService.getDocument(userId, BigInt(id));
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteDocument(
    @Param('id') id: string,
    @Req() req: RequestWithJwtUser,
  ) {
    const userId = this.extractUserId(req);
    return this.documentService.deleteDocument(userId, BigInt(id));
  }
}
