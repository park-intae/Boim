import { File } from 'expo-file-system';
import { API_BASE_URL } from './authApi';
import type {
  ApiResponse,
  DocumentUploadResponse,
  DocumentParseResponse,
  ParsedInsuranceData,
} from '@boim/shared-types';

export const uploadPolicyImage = async (
  imageUri: string,
  token?: string | null,
): Promise<DocumentUploadResponse> => {
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || 'policy_document.jpg';
  const cleanFilename = filename.includes('.') ? filename : `${filename}.jpg`;

  // Expo SDK 58의 표준 File(Blob 구현체)을 생성하여 append (Unsupported FormDataPart 방지)
  const filePart = new File(imageUri);
  formData.append('file', filePart, cleanFilename);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('[uploadPolicyImage] Uploading File(Blob) to:', `${API_BASE_URL}/documents/upload`);
  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[uploadPolicyImage] Server upload error:', response.status, errorText);
    throw new Error(`서버 업로드 오류 (${response.status})`);
  }

  const result: ApiResponse<DocumentUploadResponse> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || '증권 파일 업로드에 실패했습니다.');
  }

  return result.data;
};

export const parsePolicyDocument = async (
  documentId: string | number,
  token?: string | null,
): Promise<ParsedInsuranceData> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('[parsePolicyDocument] Sending parse request to:', `${API_BASE_URL}/documents/${documentId}/parse`);
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}/parse`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[parsePolicyDocument] Server parse error response:', response.status, errorText);
    throw new Error(`서버 파싱 오류 (${response.status})`);
  }

  const result: ApiResponse<DocumentParseResponse> = await response.json();

  if (!result.success || !result.data?.parsedData) {
    throw new Error(result.error?.message || '보험 증권 텍스트 분석에 실패했습니다.');
  }

  return result.data.parsedData;
};

export const parseSamplePolicy = async (): Promise<ParsedInsuranceData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/sample/parse`, {
      method: 'POST',
    });
    const result: ApiResponse<DocumentParseResponse> = await response.json();
    if (result.success && result.data?.parsedData) {
      return result.data.parsedData;
    }
  } catch {
    // 백엔드 연결 불안정 시 시연용 폴백
  }

  return {
    institution: '삼성화재',
    name: '다이렉트 스마트 건강보험',
    category: 'HEALTH',
    monthlyPayment: 42000,
    paymentDay: 15,
    startDate: '2024-05-15',
    maturityDate: '2044-05-15',
    coverageAmount: 50000000,
    confidence: 0.95,
  };
};
