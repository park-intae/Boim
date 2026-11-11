import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useGetInsurances,
  useGetInsurance,
  useCreateInsurance,
  useUpdateInsurance,
  useDeleteInsurance,
  insuranceKeys,
} from './useInsuranceQueries';
import { apiClient } from './client';
import { createTestQueryClient, createQueryWrapper } from '../test/utils/testQueryClient';
import { mockInsuranceProducts, mockSingleInsurance } from '../test/fixtures';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useInsuranceQueries', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  describe('useGetInsurances', () => {
    it('fetches and returns insurance list on success', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockInsuranceProducts,
      });

      const { result } = renderHook(() => useGetInsurances(), {
        wrapper: createQueryWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockInsuranceProducts);
      expect(apiClient.get).toHaveBeenCalledWith('/insurance-products');
    });

    it('throws error when response indicates failure', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: false,
        error: { message: 'Database connection error' },
      });

      const { result } = renderHook(() => useGetInsurances(), {
        wrapper: createQueryWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Database connection error');
    });
  });

  describe('useGetInsurance', () => {
    it('fetches and returns a single insurance product', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockSingleInsurance,
      });

      const { result } = renderHook(() => useGetInsurance('1'), {
        wrapper: createQueryWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockSingleInsurance);
      expect(apiClient.get).toHaveBeenCalledWith('/insurance-products/1');
    });

    it('throws error when single insurance fetch fails', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: false,
        error: { message: 'Insurance not found' },
      });

      const { result } = renderHook(() => useGetInsurance('999'), {
        wrapper: createQueryWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Insurance not found');
    });
  });

  describe('useCreateInsurance', () => {
    it('calls post api and invalidates insurance query cache on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        success: true,
        data: mockSingleInsurance,
      });

      const { result } = renderHook(() => useCreateInsurance(), {
        wrapper: createQueryWrapper(queryClient),
      });

      const newProduct = {
        userId: 1,
        category: '건강보험',
        name: '신규 보험',
        institution: '현대해상',
        startDate: '2024-01-01',
        maturityDate: '2044-01-01',
        monthlyPayment: 100000,
        coverageAmount: 50000000,
      };

      result.current.mutate(newProduct);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.post).toHaveBeenCalledWith('/insurance-products', expect.objectContaining({ name: '신규 보험' }));
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: insuranceKeys.all });
    });
  });

  describe('useUpdateInsurance', () => {
    it('calls patch api and invalidates specific and all caches on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        success: true,
        data: mockSingleInsurance,
      });

      const { result } = renderHook(() => useUpdateInsurance(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate({ id: 1, data: { name: '수정된 보험명' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.patch).toHaveBeenCalledWith('/insurance-products/1', { name: '수정된 보험명' });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: insuranceKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: insuranceKeys.detail('1') });
    });
  });

  describe('useDeleteInsurance', () => {
    it('calls delete api and invalidates caches on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        success: true,
      });

      const { result } = renderHook(() => useDeleteInsurance(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.delete).toHaveBeenCalledWith('/insurance-products/1');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: insuranceKeys.all });
    });
  });
});
