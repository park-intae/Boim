import { API_BASE_URL } from './authApi';
import type {
  ApiResponse,
  InsuranceProductDto,
  CreateInsuranceProductDto,
  UpdateInsuranceProductDto,
} from '@boim/shared-types';

export const fetchInsurances = async (token?: string | null): Promise<InsuranceProductDto[]> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/insurance-products`, {
    method: 'GET',
    headers,
  });

  const result: ApiResponse<InsuranceProductDto[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || '보험 목록을 불러오는 중 오류가 발생했습니다.');
  }

  return result.data;
};

export const createInsurance = async (
  dto: CreateInsuranceProductDto,
  token?: string | null,
): Promise<InsuranceProductDto> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/insurance-products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(dto),
  });

  const result: ApiResponse<InsuranceProductDto> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || '보험 등록 중 오류가 발생했습니다.');
  }

  return result.data;
};

export const updateInsurance = async (
  id: string | number | bigint,
  dto: UpdateInsuranceProductDto,
  token?: string | null,
): Promise<InsuranceProductDto> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/insurance-products/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(dto),
  });

  const result: ApiResponse<InsuranceProductDto> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || '보험 정보 수정 중 오류가 발생했습니다.');
  }

  return result.data;
};

export const deleteInsurance = async (
  id: string | number | bigint,
  token?: string | null,
): Promise<boolean> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/insurance-products/${id}`, {
    method: 'DELETE',
    headers,
  });

  const result: ApiResponse<{ deleted: boolean }> = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || '보험 삭제 중 오류가 발생했습니다.');
  }

  return true;
};
