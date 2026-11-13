import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserDto } from '@boim/shared-types';

const SESSION_KEY = '@boim/auth_session';

const memoryCache: Record<string, string> = {};

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const val = await AsyncStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // 조용히 메모리 폴백
    }
    return memoryCache[key] || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryCache[key] = value;
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(key, value);
      }
    } catch {
      // 조용히 메모리 폴백
    }
  },
  removeItem: async (key: string): Promise<void> => {
    delete memoryCache[key];
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(key);
      }
    } catch {
      // 조용히 메모리 폴백
    }
  },
};

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: UserDto | null;
  rememberMe: boolean;
  isLoading: boolean;
}

let globalState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  user: null,
  rememberMe: true,
  isLoading: true,
};

const listeners = new Set<(state: AuthState) => void>();

const notify = () => {
  listeners.forEach((listener) => listener({ ...globalState }));
};

export const authActions = {
  login: async (accessToken: string, user: UserDto, rememberMe: boolean) => {
    globalState = {
      ...globalState,
      isAuthenticated: true,
      accessToken,
      user,
      rememberMe,
      isLoading: false,
    };
    notify();

    if (rememberMe) {
      await safeStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ token: accessToken, user, rememberMe: true }),
      );
    } else {
      await safeStorage.removeItem(SESSION_KEY);
    }
  },

  logout: async () => {
    globalState = {
      ...globalState,
      isAuthenticated: false,
      accessToken: null,
      user: null,
      isLoading: false,
    };
    notify();

    await safeStorage.removeItem(SESSION_KEY);
  },

  loadStoredSession: async () => {
    try {
      const raw = await safeStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.token && parsed.user && parsed.rememberMe) {
          globalState = {
            ...globalState,
            isAuthenticated: true,
            accessToken: parsed.token,
            user: parsed.user,
            rememberMe: true,
            isLoading: false,
          };
          notify();
          return;
        }
      }
    } catch {
      // 조용히 비로그인 상태로 진입
    }

    globalState = {
      ...globalState,
      isAuthenticated: false,
      accessToken: null,
      user: null,
      isLoading: false,
    };
    notify();
  },
};

export const useMobileAuth = () => {
  const [state, setState] = useState<AuthState>(globalState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    login: authActions.login,
    logout: authActions.logout,
  };
};
