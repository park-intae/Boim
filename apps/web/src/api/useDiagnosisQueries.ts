import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { InsuranceDiagnosisDto } from '@boim/shared-types';
import { isDemoSession, getDemoDiagnosis } from '../features/auth/utils/demoFallback';

export const diagnosisKeys = {
  all: ['diagnosis'] as const,
  current: () => [...diagnosisKeys.all, 'current'] as const,
};

export function useGetDiagnosis() {
  return useQuery({
    queryKey: diagnosisKeys.current(),
    queryFn: async () => {
      if (isDemoSession()) {
        return getDemoDiagnosis();
      }
      const response = await apiClient.get<Record<string, unknown>>('/analysis/ai-diagnosis');
      const resObj = response as unknown as Record<string, unknown>;
      const data = resObj?.data || resObj;
      return data as unknown as InsuranceDiagnosisDto;
    },
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
}

export function useGenerateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (isDemoSession()) {
        return getDemoDiagnosis();
      }
      const response = await apiClient.post<Record<string, unknown>>('/analysis/ai-diagnosis', {});
      const resObj = response as unknown as Record<string, unknown>;
      const data = resObj?.data || resObj;
      return data as unknown as InsuranceDiagnosisDto;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(diagnosisKeys.current(), data);
    },
  });
}

export function useExportExcel() {
  return useMutation({
    mutationFn: async () => {
      // 바이너리 blob 수신을 위해 responseType: 'blob' 지정
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('boim_access_token') || sessionStorage.getItem('boim_access_token');

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseURL}/analysis/export/excel`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('엑셀 리포트 다운로드에 실패했습니다.');
      }

      const blob = await response.blob();
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const filename = `boim_insurance_report_${dateStr}.xlsx`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return true;
    },
  });
}
