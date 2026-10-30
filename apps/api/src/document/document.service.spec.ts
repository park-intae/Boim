/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
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
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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

    it('파일 용량이 10MB를 초과하면 BadRequestException을 던져야 한다', async () => {
      const largeFile = {
        originalname: 'large.pdf',
        mimetype: 'application/pdf',
        size: 11 * 1024 * 1024,
        buffer: Buffer.from('large'),
      } as Express.Multer.File;

      await expect(service.uploadDocument(1n, largeFile)).rejects.toThrow(
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

  describe('getDocument (Row-level 권한 검증)', () => {
    it('문서가 없으면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(service.getDocument(1n, 999n)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('타인의 문서에 접근하면 ForbiddenException을 던져야 한다', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue({
        id: 10n,
        userId: 2n, // 다른 유저
      });

      await expect(service.getDocument(1n, 10n)).rejects.toThrow(
        ForbiddenException,
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

  describe('getUserDocuments', () => {
    it('사용자의 문서 목록을 반환해야 한다', async () => {
      const mockDocs = [
        {
          id: 10n,
          userId: 1n,
          productId: null,
          fileName: 'policy1.pdf',
          fileUrl: '/uploads/documents/mock1.pdf',
          fileSize: 1000,
          mimeType: 'application/pdf',
          ocrText: null,
          parsedData: null,
          uploadedAt: new Date('2026-10-30T00:00:00Z'),
        },
      ];
      mockPrismaService.document.findMany.mockResolvedValue(mockDocs);

      const result = await service.getUserDocuments(1n);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(10);
    });
  });

  describe('deleteDocument (Row-level 권한 검증)', () => {
    it('문서가 없으면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(service.deleteDocument(1n, 999n)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('타인의 문서 삭제 시 ForbiddenException을 던져야 한다', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue({
        id: 10n,
        userId: 2n,
        fileUrl: '/uploads/documents/test.pdf',
      });

      await expect(service.deleteDocument(1n, 10n)).rejects.toThrow(
        ForbiddenException,
      );
    });

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

  describe('getSamplePreset', () => {
    it('모의 가상 증권 샘플 프리셋을 정상 반환해야 한다', () => {
      const preset = service.getSamplePreset();
      expect(preset.sampleName).toBeDefined();
      expect(preset.mockData.institution).toBe('한화손해보험');
      expect(preset.mockData.monthlyPayment).toBe(85000);
    });
  });
});
