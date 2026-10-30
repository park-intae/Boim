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
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import type { RequestWithJwtUser } from '../auth/auth.controller';
import * as multer from 'multer';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('sample/preset')
  getSamplePreset() {
    return {
      success: true,
      data: this.documentService.getSamplePreset(),
    };
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithJwtUser,
    @Query('productId') productId?: string,
  ) {
    const userId = BigInt(req.user?.userId || '1');
    const result = await this.documentService.uploadDocument(
      userId,
      file,
      productId ? BigInt(productId) : undefined,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUserDocuments(@Req() req: RequestWithJwtUser) {
    const userId = BigInt(req.user?.userId || '1');
    const documents = await this.documentService.getUserDocuments(userId);

    return {
      success: true,
      data: documents,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getDocument(@Param('id') id: string, @Req() req: RequestWithJwtUser) {
    const userId = BigInt(req.user?.userId || '1');
    const document = await this.documentService.getDocument(userId, BigInt(id));

    return {
      success: true,
      data: document,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteDocument(
    @Param('id') id: string,
    @Req() req: RequestWithJwtUser,
  ) {
    const userId = BigInt(req.user?.userId || '1');
    const result = await this.documentService.deleteDocument(
      userId,
      BigInt(id),
    );

    return {
      success: true,
      data: result,
    };
  }
}
