import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useGetDiagnosis,
  useGenerateDiagnosis,
  useExportExcel,
} from './useDiagnosisQueries';
import { apiClient } from './client';
import { createTestQueryClient, createQueryWrapper } from '../test/utils/testQueryClient';
import { mockDiagnosisData } from '../test/fixtures';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('useDiagnosisQueries', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  describe('useGetDiagnosis', () => {
    it('fetches diagnosis data successfully', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockDiagnosisData,
      });

      const { result } = renderHook(() => useGetDiagnosis(), {
        wrapper: createQueryWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockDiagnosisData);
      expect(apiClient.get).toHaveBeenCalledWith('/analysis/ai-diagnosis');
    });
  });

  describe('useGenerateDiagnosis', () => {
    it('generates diagnosis and sets query data cache on success', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockDiagnosisData,
      });

      const { result } = renderHook(() => useGenerateDiagnosis(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.post).toHaveBeenCalledWith('/analysis/ai-diagnosis', {});
      expect(result.current.data).toEqual(mockDiagnosisData);
    });
  });

  describe('useExportExcel', () => {
    it('downloads excel report as blob on success', async () => {
      const mockBlob = new Blob(['mock excel'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        blob: vi.fn().mockResolvedValueOnce(mockBlob),
      } as unknown as Response);

      const { result } = renderHook(() => useExportExcel(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/analysis/export/excel'),
        expect.any(Object)
      );

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('throws error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
      } as unknown as Response);

      const { result } = renderHook(() => useExportExcel(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('엑셀 리포트 다운로드에 실패했습니다.');
    });
  });
});
