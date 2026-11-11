import { describe, it, expect, beforeEach } from 'vitest';
import { apiClient } from './client';
import { useAuthStore } from '../features/auth/store/authStore';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

describe('apiClient interceptors', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('injects Bearer token into headers when token exists in authStore', async () => {
    useAuthStore.getState().login(
      { id: '1', email: 'test@example.com', isPassVerified: true },
      'test-access-token'
    );

    // Get the request interceptor handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestHandler = (apiClient.interceptors.request as any).handlers[0].fulfilled;

    const config = { headers: {} } as InternalAxiosRequestConfig;
    const modifiedConfig = await requestHandler(config);

    expect(modifiedConfig.headers.Authorization).toBe('Bearer test-access-token');
  });

  it('does not inject Authorization header when token is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestHandler = (apiClient.interceptors.request as any).handlers[0].fulfilled;

    const config = { headers: {} } as InternalAxiosRequestConfig;
    const modifiedConfig = await requestHandler(config);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });

  it('unwraps response.data on successful response', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseHandler = (apiClient.interceptors.response as any).handlers[0].fulfilled;

    const mockResponse = {
      data: { success: true, data: { id: 1 } },
      status: 200,
    } as AxiosResponse;

    const result = responseHandler(mockResponse);
    expect(result).toEqual({ success: true, data: { id: 1 } });
  });

  it('rejects with server error payload on error response with data', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorHandler = (apiClient.interceptors.response as any).handlers[0].rejected;

    const mockError = {
      response: {
        data: {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' },
        },
      },
    };

    await expect(errorHandler(mockError)).rejects.toEqual({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' },
    });
  });

  it('rejects with default NETWORK_ERROR when error has no response payload', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorHandler = (apiClient.interceptors.response as any).handlers[0].rejected;

    const mockError = new Error('Network timeout');

    await expect(errorHandler(mockError)).rejects.toEqual({
      success: false,
      error: { code: 'NETWORK_ERROR', message: '서버와 통신할 수 없습니다.' },
    });
  });
});
