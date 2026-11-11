import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useUploadDocument,
  useParseDocument,
  useParseSampleDocument,
  useGetSamplePreset,
} from './useDocumentQueries';
import { apiClient } from './client';
import { createTestQueryClient, createQueryWrapper } from '../test/utils/testQueryClient';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('useDocumentQueries', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  describe('useUploadDocument', () => {
    it('uploads document with FormData', async () => {
      const mockFile = new File(['dummy'], 'policy.pdf', { type: 'application/pdf' });
      const mockResponse = {
        data: {
          documentId: 10,
          fileUrl: 'http://example.com/policy.pdf',
          fileName: 'policy.pdf',
          uploadedAt: '2026-11-11T00:00:00.000Z',
        },
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useUploadDocument(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate({ file: mockFile, productId: 1 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.documentId).toBe(10);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/documents/upload',
        expect.any(FormData),
        expect.objectContaining({ params: { productId: 1 } })
      );
    });
  });

  describe('useParseDocument', () => {
    it('parses uploaded document by id', async () => {
      const mockParsed = {
        data: {
          documentId: 10,
          ocrText: '추출된 텍스트',
          parsedData: {
            institution: '삼성화재',
            name: '실손의료비',
            category: '실손',
            monthlyPayment: 30000,
            startDate: '2023-01-01',
            maturityDate: '2053-01-01',
            coverageAmount: 50000000,
          },
        },
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockParsed);

      const { result } = renderHook(() => useParseDocument(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate({ documentId: 10 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.documentId).toBe(10);
      expect(apiClient.post).toHaveBeenCalledWith('/documents/10/parse');
    });
  });

  describe('useParseSampleDocument', () => {
    it('parses sample preset document', async () => {
      const mockSampleResponse = {
        data: {
          documentId: 'sample-1',
          ocrText: '샘플 OCR 텍스트',
          parsedData: {
            institution: '현대해상',
            name: '어린이보험',
            category: '건강',
            monthlyPayment: 50000,
            startDate: '2023-01-01',
            maturityDate: '2053-01-01',
            coverageAmount: 30000000,
          },
        },
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockSampleResponse);

      const { result } = renderHook(() => useParseSampleDocument(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.documentId).toBe('sample-1');
      expect(apiClient.post).toHaveBeenCalledWith('/documents/sample/parse');
    });
  });

  describe('useGetSamplePreset', () => {
    it('fetches sample preset info', async () => {
      const mockPreset = {
        data: {
          sampleName: '표준 모의 증권',
          fileName: 'sample_policy.pdf',
          mimeType: 'application/pdf',
          mockData: {
            institution: '현대해상',
            name: '어린이보험',
            category: '건강',
            monthlyPayment: 50000,
            startDate: '2023-01-01',
            maturityDate: '2053-01-01',
            coverageAmount: 30000000,
          },
        },
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockPreset);

      const { result } = renderHook(() => useGetSamplePreset(), {
        wrapper: createQueryWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.fileName).toBe('sample_policy.pdf');
      expect(apiClient.get).toHaveBeenCalledWith('/documents/sample/preset');
    });
  });
});
