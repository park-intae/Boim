/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { DocumentParserService } from './document-parser.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    promises: {
      writeFile: jest.fn().mockResolvedValue(undefined),
      copyFile: jest.fn().mockResolvedValue(undefined),
      unlink: jest.fn().mockResolvedValue(undefined),
      readFile: jest.fn().mockResolvedValue('샘플 텍스트'),
    },
  };
});

describe('DocumentService', () => {
  let service: DocumentService;

  const mockPrismaService = {
    document: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockParserService = {
    extractTextFromFile: jest.fn().mockResolvedValue('추출된 증권 텍스트'),
    parseInsuranceText: jest.fn().mockReturnValue({
      institution: '한화손해보험',
      name: '무배당 한화 라이프케어 건강종합보험',
      category: 'HEALTH',
      monthlyPayment: 85000,
      paymentDay: 15,
      startDate: '2024-03-01',
      maturityDate: '2044-03-01',
      coverageAmount: 50000000,
      confidence: 0.99,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: DocumentParserService,
          useValue: mockParserService,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    jest.clearAllMocks();
  });

  describe('uploadDocument', () => {
    it('파일이 제공되지 않으면 BadRequestException을 던져야 한다', async () => {
      await expect(service.uploadDocument(1n, undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('지원하지 않는 파일 형식이면 BadRequestException을 던져야 한다', async () => {
      const invalidFile = {
        originalname: 'test.exe',
        mimetype: 'application/x-msdownload',
        size: 1024,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      await expect(service.uploadDocument(1n, invalidFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('유효한 PDF 파일 업로드 시 성공적으로 문서를 생성하고 응답해야 한다', async () => {
      const validFile = {
        originalname: 'insurance_policy.pdf',
        mimetype: 'application/pdf',
        size: 2 * 1024 * 1024,
        buffer: Buffer.from('pdf data'),
      } as Express.Multer.File;

      const mockCreated = {
        id: 10n,
        userId: 1n,
        productId: null,
        fileName: 'insurance_policy.pdf',
        fileUrl: '/uploads/documents/mock.pdf',
        fileSize: 2 * 1024 * 1024,
        mimeType: 'application/pdf',
        ocrText: null,
        parsedData: null,
        uploadedAt: new Date('2026-10-30T00:00:00Z'),
      };

      mockPrismaService.document.create.mockResolvedValue(mockCreated);

      const result = await service.uploadDocument(1n, validFile);

      expect(mockPrismaService.document.create).toHaveBeenCalled();
      expect(result).toEqual({
        documentId: 10,
        fileUrl: '/uploads/documents/mock.pdf',
        fileName: 'insurance_policy.pdf',
        uploadedAt: '2026-10-30T00:00:00.000Z',
      });
    });
  });

  describe('parseDocument (패턴 매칭 파싱)', () => {
    it('타인 문서 파싱 시 ForbiddenException을 던져야 한다', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue({
        id: 10n,
        userId: 2n,
      });

      await expect(service.parseDocument(1n, 10n)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('본인 문서 파싱 시 텍스트 추출 및 패턴 매칭 결과를 DB에 저장하고 반환해야 한다', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue({
        id: 10n,
        userId: 1n,
        fileUrl: '/uploads/documents/sample.pdf',
        mimeType: 'application/pdf',
      });
      mockPrismaService.document.update.mockResolvedValue({ id: 10n });

      const result = await service.parseDocument(1n, 10n);

      expect(mockParserService.extractTextFromFile).toHaveBeenCalled();
      expect(mockParserService.parseInsuranceText).toHaveBeenCalled();
      expect(mockPrismaService.document.update).toHaveBeenCalled();
      expect(result.documentId).toBe(10);
      expect(result.parsedData.institution).toBe('한화손해보험');
    });
  });

  describe('parseSampleDocument', () => {
    it('샘플 프리셋 텍스트를 파싱하여 정상 반환해야 한다', async () => {
      const result = await service.parseSampleDocument();

      expect(result.documentId).toBe('sample-preset');
      expect(result.parsedData.institution).toBe('한화손해보험');
      expect(result.parsedData.monthlyPayment).toBe(85000);
    });
  });

  describe('getDocument (Row-level 권한 검증)', () => {
    it('문서가 없으면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(service.getDocument(1n, 999n)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('본인의 문서인 경우 정상 반환해야 한다', async () => {
      const mockDoc = {
        id: 10n,
        userId: 1n,
        productId: null,
        fileName: 'policy.pdf',
        fileUrl: '/uploads/documents/mock.pdf',
        fileSize: 1000,
        mimeType: 'application/pdf',
        ocrText: null,
        parsedData: null,
        uploadedAt: new Date('2026-10-30T00:00:00Z'),
      };
      mockPrismaService.document.findUnique.mockResolvedValue(mockDoc);

      const result = await service.getDocument(1n, 10n);

      expect(result.id).toBe(10);
      expect(result.fileName).toBe('policy.pdf');
    });
  });

  describe('deleteDocument', () => {
    it('본인의 문서인 경우 정상 삭제해야 한다', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue({
        id: 10n,
        userId: 1n,
        fileUrl: '/uploads/documents/test.pdf',
      });
      mockPrismaService.document.delete.mockResolvedValue({ id: 10n });

      const result = await service.deleteDocument(1n, 10n);

      expect(mockPrismaService.document.delete).toHaveBeenCalledWith({
        where: { id: 10n },
      });
      expect(result.success).toBe(true);
    });
  });
});
