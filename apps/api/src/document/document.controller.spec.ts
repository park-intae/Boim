/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import type { RequestWithJwtUser } from '../auth/auth.controller';
import type { ParsedInsuranceData } from '@boim/shared-types';

describe('DocumentController', () => {
  let controller: DocumentController;
  let service: DocumentService;

  const mockDocumentService = {
    getSamplePreset: jest.fn(),
    uploadDocument: jest.fn(),
    getUserDocuments: jest.fn(),
    getDocument: jest.fn(),
    deleteDocument: jest.fn(),
  };

  const mockRequest = {
    user: {
      userId: '1',
      email: 'test@boim.com',
    },
  } as RequestWithJwtUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    service = module.get<DocumentService>(DocumentService);
    jest.clearAllMocks();
  });

  describe('getSamplePreset', () => {
    it('샘플 프리셋을 성공 포맷으로 반환해야 한다', () => {
      const mockPreset = {
        sampleName: '샘플 증권',
        fileName: 'sample.pdf',
        mimeType: 'application/pdf',
        mockData: {} as ParsedInsuranceData,
      };
      mockDocumentService.getSamplePreset.mockReturnValue(mockPreset);

      const result = controller.getSamplePreset();

      expect(result).toEqual({
        success: true,
        data: mockPreset,
      });
    });
  });

  describe('uploadFile', () => {
    it('파일 업로드 후 결과를 공통 포맷으로 반환해야 한다', async () => {
      const mockFile = {
        originalname: 'test.pdf',
      } as Express.Multer.File;

      const mockResponse = {
        documentId: 10,
        fileUrl: '/uploads/documents/test.pdf',
        fileName: 'test.pdf',
        uploadedAt: '2026-10-30T00:00:00.000Z',
      };
      mockDocumentService.uploadDocument.mockResolvedValue(mockResponse);

      const result = await controller.uploadFile(mockFile, mockRequest, '5');

      expect(service.uploadDocument).toHaveBeenCalledWith(1n, mockFile, 5n);
      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });
  });

  describe('getUserDocuments', () => {
    it('사용자의 문서 목록을 공통 포맷으로 반환해야 한다', async () => {
      const mockList = [{ id: 10, fileName: 'test.pdf' }];
      mockDocumentService.getUserDocuments.mockResolvedValue(mockList);

      const result = await controller.getUserDocuments(mockRequest);

      expect(service.getUserDocuments).toHaveBeenCalledWith(1n);
      expect(result).toEqual({
        success: true,
        data: mockList,
      });
    });
  });

  describe('getDocument', () => {
    it('특정 문서 상세 정보를 반환해야 한다', async () => {
      const mockDoc = { id: 10, fileName: 'test.pdf' };
      mockDocumentService.getDocument.mockResolvedValue(mockDoc);

      const result = await controller.getDocument('10', mockRequest);

      expect(service.getDocument).toHaveBeenCalledWith(1n, 10n);
      expect(result).toEqual({
        success: true,
        data: mockDoc,
      });
    });
  });

  describe('deleteDocument', () => {
    it('문서 삭제 후 결과를 반환해야 한다', async () => {
      mockDocumentService.deleteDocument.mockResolvedValue({
        success: true,
        message: '삭제 완료',
      });

      const result = await controller.deleteDocument('10', mockRequest);

      expect(service.deleteDocument).toHaveBeenCalledWith(1n, 10n);
      expect(result).toEqual({
        success: true,
        data: { success: true, message: '삭제 완료' },
      });
    });
  });
});
