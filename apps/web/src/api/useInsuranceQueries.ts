import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { InsuranceProductDto, CreateInsuranceProductDto, UpdateInsuranceProductDto, ApiResponse } from '@boim/shared-types';

export const insuranceKeys = {
  all: ['insuranceProducts'] as const,
  detail: (id: number | string) => [...insuranceKeys.all, id] as const,
};

// --- GET All ---
export const useGetInsurances = () => {
  return useQuery({
    queryKey: insuranceKeys.all,
    queryFn: async () => {
      const response = await apiClient.get<never, ApiResponse<InsuranceProductDto[]>>('/insurance-products');
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch insurances');
      }
      return response.data;
    }
  });
};

// --- GET One ---
export const useGetInsurance = (id: string | number) => {
  return useQuery({
    queryKey: insuranceKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<never, ApiResponse<InsuranceProductDto>>(`/insurance-products/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch insurance detail');
      }
      return response.data;
    }
  });
};

// --- CREATE ---
export const useCreateInsurance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct: CreateInsuranceProductDto) => {
      // API expects userId. Hardcode for MVP since no auth.
      const payload = { ...newProduct, userId: 1 };
      const response = await apiClient.post<never, ApiResponse<InsuranceProductDto>>('/insurance-products', payload);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create insurance');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insuranceKeys.all });
    }
  });
};

// --- UPDATE ---
export const useUpdateInsurance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number, data: UpdateInsuranceProductDto }) => {
      const response = await apiClient.patch<never, ApiResponse<InsuranceProductDto>>(`/insurance-products/${id}`, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update insurance');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: insuranceKeys.all });
      queryClient.invalidateQueries({ queryKey: insuranceKeys.detail(data.id.toString()) });
    }
  });
};

// --- DELETE ---
export const useDeleteInsurance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.delete<never, ApiResponse<void>>(`/insurance-products/${id}`);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete insurance');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insuranceKeys.all });
    }
  });
};
