import { API_BASE_URL } from './authApi';
import type { ApiResponse } from '@boim/shared-types';

export interface PassRequestResponse {
  transactionId: string;
}

export interface PassVerifyResponse {
  message: string;
}

export const requestPassCode = async (phoneNumber: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/pass/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber }),
  });

  const result: ApiResponse<PassRequestResponse> = await response.json();
  if (!result.success || !result.data?.transactionId) {
    throw new Error(result.error?.message || '인증번호 발송에 실패했습니다.');
  }

  return result.data.transactionId;
};

export const verifyPassCode = async (
  transactionId: string,
  code: string,
  token?: string | null,
): Promise<string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/auth/pass/verify`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ transactionId, code }),
  });

  const result: ApiResponse<PassVerifyResponse> = await response.json();
  if (!result.success) {
    throw new Error(result.error?.message || '인증번호 검증에 실패했습니다.');
  }

  return result.data?.message || '본인인증이 완료되었습니다.';
};
