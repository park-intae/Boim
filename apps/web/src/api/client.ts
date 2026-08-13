import axios from 'axios';
import type { ApiResponse } from '@boim/shared-types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const apiError: ApiResponse = error.response?.data || {
      success: false,
      error: { code: 'NETWORK_ERROR', message: '서버와 통신할 수 없습니다.' }
    };
    return Promise.reject(apiError);
  }
);
