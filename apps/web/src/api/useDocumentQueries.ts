import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  ApiResponse,
  DocumentUploadResponse,
  DocumentParseResponse,
  ParsedInsuranceData,
} from '@boim/shared-types';

function unwrapResponse<T>(res: unknown): T {
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>;
    if ('data' in obj && obj.data !== undefined) {
      return unwrapResponse<T>(obj.data);
    }
  }
  return res as T;
}

export function useUploadDocument() {
  return useMutation<DocumentUploadResponse, ApiResponse, { file: File; productId?: number }>({
    mutationFn: async ({ file, productId }) => {
      const formData = new FormData();
      formData.append('file', file);

      const params = productId ? { productId } : {};
      const res = await apiClient.post<unknown, ApiResponse<DocumentUploadResponse>>(
        '/documents/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          params,
        },
      );
      return unwrapResponse<DocumentUploadResponse>(res);
    },
  });
}

export function useParseDocument() {
  return useMutation<DocumentParseResponse, ApiResponse, { documentId: number | string }>({
    mutationFn: async ({ documentId }) => {
      const res = await apiClient.post<unknown, ApiResponse<DocumentParseResponse>>(
        `/documents/${documentId}/parse`,
      );
      return unwrapResponse<DocumentParseResponse>(res);
    },
  });
}

export function useParseSampleDocument() {
  return useMutation<DocumentParseResponse, ApiResponse, void>({
    mutationFn: async () => {
      const res = await apiClient.post<unknown, ApiResponse<DocumentParseResponse>>(
        '/documents/sample/parse',
      );
      return unwrapResponse<DocumentParseResponse>(res);
    },
  });
}

export function useGetSamplePreset() {
  return useQuery({
    queryKey: ['documents', 'sample-preset'],
    queryFn: async () => {
      const res = await apiClient.get<unknown, ApiResponse<{
        sampleName: string;
        fileName: string;
        mimeType: string;
        mockData: ParsedInsuranceData;
      }>>('/documents/sample/preset');
      return unwrapResponse<{
        sampleName: string;
        fileName: string;
        mimeType: string;
        mockData: ParsedInsuranceData;
      }>(res);
    },
  });
}
