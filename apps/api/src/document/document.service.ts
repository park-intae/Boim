import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { DocumentUploadResponse, DocumentDto } from '@boim/shared-types';

@Injectable()
export class DocumentService {
  private readonly uploadDir = path.resolve(
    process.cwd(),
    'uploads',
    'documents',
  );
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadDocument(
    userId: bigint,
    file?: Express.Multer.File,
    productId?: bigint,
  ): Promise<DocumentUploadResponse> {
    if (!file) {
      throw new BadRequestException('업로드할 파일이 제공되지 않았습니다.');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        '지원하지 않는 파일 형식입니다. (지원 형식: PDF, PNG, JPG, JPEG)',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        '파일 용량은 최대 10MB를 초과할 수 없습니다.',
      );
    }

    const ext = path.extname(file.originalname) || '.pdf';
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const safeFileName = `${uniqueSuffix}${ext}`;
    const filePath = path.join(this.uploadDir, safeFileName);

    if (file.buffer) {
      await fs.promises.writeFile(filePath, file.buffer);
    } else if (file.path && file.path !== filePath) {
      await fs.promises.copyFile(file.path, filePath);
    }

    const fileUrl = `/uploads/documents/${safeFileName}`;

    const document = await this.prisma.document.create({
      data: {
        userId,
        productId: productId || null,
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    return {
      documentId: Number(document.id),
      fileUrl: document.fileUrl,
      fileName: document.fileName,
      uploadedAt: document.uploadedAt.toISOString(),
    };
  }

  async getDocument(userId: bigint, documentId: bigint): Promise<DocumentDto> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('문서를 찾을 수 없습니다.');
    }

    if (document.userId !== userId) {
      throw new ForbiddenException('해당 문서에 대한 접근 권한이 없습니다.');
    }

    return {
      id: Number(document.id),
      userId: Number(document.userId),
      productId: document.productId ? Number(document.productId) : null,
      fileUrl: document.fileUrl,
      fileName: document.fileName,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      ocrText: document.ocrText,
      parsedData: document.parsedData as Record<string, unknown> | null,
      uploadedAt: document.uploadedAt.toISOString(),
    };
  }

  async getUserDocuments(userId: bigint): Promise<DocumentDto[]> {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });

    return documents.map((doc) => ({
      id: Number(doc.id),
      userId: Number(doc.userId),
      productId: doc.productId ? Number(doc.productId) : null,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      ocrText: doc.ocrText,
      parsedData: doc.parsedData as Record<string, unknown> | null,
      uploadedAt: doc.uploadedAt.toISOString(),
    }));
  }

  async deleteDocument(
    userId: bigint,
    documentId: bigint,
  ): Promise<{ success: boolean; message: string }> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('문서를 찾을 수 없습니다.');
    }

    if (document.userId !== userId) {
      throw new ForbiddenException('해당 문서를 삭제할 권한이 없습니다.');
    }

    // 파일 시스템에서 파일 삭제 시도
    const fileName = path.basename(document.fileUrl);
    const diskPath = path.join(this.uploadDir, fileName);
    if (fs.existsSync(diskPath)) {
      try {
        await fs.promises.unlink(diskPath);
      } catch {
        // 파일 삭제 실패해도 DB 삭제는 진행
      }
    }

    await this.prisma.document.delete({
      where: { id: documentId },
    });

    return {
      success: true,
      message: '문서가 성공적으로 삭제되었습니다.',
    };
  }

  /**
   * 개인정보 보호용 가상 모의 증권 프리셋 데이터 반환
   */
  getSamplePreset() {
    return {
      sampleName: '무배당 한화 라이프케어 건강종합보험 증권 (모의 샘플)',
      fileName: 'sample_policy_preset.pdf',
      mimeType: 'application/pdf',
      mockData: {
        institution: '한화손해보험',
        name: '무배당 한화 라이프케어 건강종합보험',
        category: 'HEALTH',
        monthlyPayment: 85000,
        paymentDay: 15,
        startDate: '2024-03-01',
        maturityDate: '2044-03-01',
        coverageAmount: 50000000,
        confidence: 0.98,
      },
    };
  }
}
