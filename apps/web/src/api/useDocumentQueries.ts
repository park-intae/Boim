import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  ApiResponse,
  DocumentUploadResponse,
  DocumentParseResponse,
  ParsedInsuranceData,
} from '@boim/shared-types';

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
      if (!res.success || !res.data) {
        throw new Error(res.error?.message || '문서 업로드에 실패했습니다.');
      }
      return res.data;
    },
  });
}

export function useParseDocument() {
  return useMutation<DocumentParseResponse, ApiResponse, { documentId: number | string }>({
    mutationFn: async ({ documentId }) => {
      const res = await apiClient.post<unknown, ApiResponse<DocumentParseResponse>>(
        `/documents/${documentId}/parse`,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error?.message || '문서 분석에 실패했습니다.');
      }
      return res.data;
    },
  });
}

export function useParseSampleDocument() {
  return useMutation<DocumentParseResponse, ApiResponse, void>({
    mutationFn: async () => {
      const res = await apiClient.post<unknown, ApiResponse<DocumentParseResponse>>(
        '/documents/sample/parse',
      );
      if (!res.success || !res.data) {
        throw new Error(res.error?.message || '샘플 분석에 실패했습니다.');
      }
      return res.data;
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
      return res.data;
    },
  });
}
