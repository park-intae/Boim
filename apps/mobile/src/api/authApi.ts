import Constants from 'expo-constants';
import type { ApiResponse, UserDto } from '@boim/shared-types';

const debuggerHost = Constants.expoConfig?.hostUri;
const hostIp = debuggerHost ? debuggerHost.split(':')[0] : '10.138.11.34';
export const API_BASE_URL = `http://${hostIp}:4000/api`;

export interface LoginResult {
  accessToken: string;
  refreshToken?: string;
  user: UserDto;
}

export const requestLogin = async (
  email: string,
  password?: string,
  rememberMe?: boolean,
): Promise<LoginResult> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, rememberMe }),
  });

  const result: ApiResponse<LoginResult> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || '로그인에 실패했습니다.');
  }

  return result.data;
};

export const requestRegister = async (
  email: string,
  password: string,
  name?: string,
): Promise<LoginResult> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  const result: ApiResponse<LoginResult> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || '회원가입에 실패했습니다.');
  }

  return result.data;
};
