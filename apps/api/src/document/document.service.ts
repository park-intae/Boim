import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentParserService } from './document-parser.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type {
  DocumentUploadResponse,
  DocumentParseResponse,
  DocumentDto,
} from '@boim/shared-types';

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
    'text/plain',
  ];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(
    private readonly prisma: PrismaService,
    private readonly parserService: DocumentParserService,
  ) {
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
        '지원하지 않는 파일 형식입니다. (지원 형식: PDF, PNG, JPG, JPEG, TXT)',
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

    const fileName = path.basename(document.fileUrl);
    const diskPath = path.join(this.uploadDir, fileName);
    if (fs.existsSync(diskPath)) {
      try {
        await fs.promises.unlink(diskPath);
      } catch {
        // ignore
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
   * 업로드된 특정 문서를 패턴 매칭 엔진으로 파싱하고 DB에 결과 캐싱
   */
  async parseDocument(
    userId: bigint,
    documentId: bigint,
  ): Promise<DocumentParseResponse> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('문서를 찾을 수 없습니다.');
    }

    if (document.userId !== userId) {
      throw new ForbiddenException('해당 문서에 대한 접근 권한이 없습니다.');
    }

    const fileName = path.basename(document.fileUrl);
    const diskPath = path.join(this.uploadDir, fileName);

    const ocrText = await this.parserService.extractTextFromFile(
      diskPath,
      document.mimeType,
    );
    const parsedData = this.parserService.parseInsuranceText(ocrText);

    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        ocrText,
        parsedData: JSON.parse(JSON.stringify(parsedData)),
      },
    });

    return {
      documentId: Number(document.id),
      ocrText,
      parsedData,
    };
  }

  /**
   * 개인정보 보호용 가상 모의 증권 샘플 즉시 파싱 테스트
   */
  async parseSampleDocument(): Promise<DocumentParseResponse> {
    const samplePath = path.resolve(
      process.cwd(),
      '..',
      'web',
      'public',
      'samples',
      'sample_policy_preset.txt',
    );

    let text: string;
    if (fs.existsSync(samplePath)) {
      text = await fs.promises.readFile(samplePath, 'utf-8');
    } else {
      text = `
증권번호: POL-2024-8839210
보험회사: 한화손해보험 주식회사
상 품 명: 무배당 한화 라이프케어 건강종합보험
보 험 종: 건강보험 (HEALTH)
보험기간: 2024년 03월 01일 ~ 2044년 03월 01일
월 보험료: 85,000원 (매월 15일 자동이체)
보장금액: 50,000,000원
`;
    }

    const parsedData = this.parserService.parseInsuranceText(text);

    return {
      documentId: 'sample-preset',
      ocrText: text,
      parsedData,
    };
  }

  getSamplePreset() {
    return {
      sampleName: '무배당 한화 라이프케어 건강종합보험 증권 (모의 샘플)',
      fileName: 'sample_policy_preset.txt',
      mimeType: 'text/plain',
      mockData: {
        institution: '한화손해보험',
        name: '무배당 한화 라이프케어 건강종합보험',
        category: 'HEALTH',
        monthlyPayment: 85000,
        paymentDay: 15,
        startDate: '2024-03-01',
        maturityDate: '2044-03-01',
        coverageAmount: 50000000,
        confidence: 0.99,
      },
    };
  }
}
