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
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  } as unknown as Blob);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

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

  const response = await fetch(`${API_BASE_URL}/documents/${documentId}/parse`, {
    method: 'POST',
    headers,
  });

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
