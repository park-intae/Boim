import { API_BASE_URL } from './authApi';
import type { ApiResponse, InsuranceDiagnosisDto } from '@boim/shared-types';

export const requestAiDiagnosis = async (
  token?: string | null,
): Promise<InsuranceDiagnosisDto> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/analysis/ai-diagnosis`, {
    method: 'POST',
    headers,
  });

  const result: ApiResponse<InsuranceDiagnosisDto> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'AI 종합 진단 요청에 실패했습니다.');
  }

  return result.data;
};

export const fetchAiDiagnosis = async (
  token?: string | null,
): Promise<InsuranceDiagnosisDto> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/analysis/ai-diagnosis`, {
    method: 'GET',
    headers,
  });

  const result: ApiResponse<InsuranceDiagnosisDto> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'AI 진단 결과를 불러오지 못했습니다.');
  }

  return result.data;
};
