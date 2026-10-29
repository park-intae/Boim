import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { logAuthEvent } from '../utils/authLogger';

export interface User {
  id: string;
  email: string;
  name?: string;
  isPassVerified: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setRememberMe: (status: boolean) => void;
  setPassVerified: (status: boolean) => void;
}

const hybridStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const local = localStorage.getItem(name);
    if (local) {
      return local;
    }
    const session = sessionStorage.getItem(name);
    return session;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const parsed = JSON.parse(value);
      if (parsed?.state?.rememberMe) {
        localStorage.setItem(name, value);
        sessionStorage.removeItem(name);
        logAuthEvent('💾 인증 정보가 localStorage(기기 기억 ON - 영구 보관)에 동기화되었습니다.', {
          email: parsed.state.user?.email,
          storage: 'localStorage',
        });
      } else {
        sessionStorage.setItem(name, value);
        localStorage.removeItem(name);
        logAuthEvent('⏱️ 인증 정보가 sessionStorage(기기 기억 OFF - 세션 유지)에 동기화되었습니다.', {
          email: parsed.state.user?.email,
          storage: 'sessionStorage',
        });
      }
    } catch {
      sessionStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      rememberMe: false,

      login: (user, token) => {
        const rememberMe = get().rememberMe;
        logAuthEvent(`🔑 로그인 성공: ${user.email} (기기 기억하기: ${rememberMe ? 'ON' : 'OFF'})`);
        set({ user, accessToken: token, isAuthenticated: true });
      },
        
      logout: () => {
        logAuthEvent('🚪 로그아웃 완료: 모든 스토리지(localStorage / sessionStorage) 및 상태가 초기화되었습니다.');
        set({ user: null, accessToken: null, isAuthenticated: false, rememberMe: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('boim-auth-storage');
          sessionStorage.removeItem('boim-auth-storage');
        }
      },
        
      setRememberMe: (status) => {
        logAuthEvent(`⚙️ 기기 기억하기(Remember Me) 설정 변경: ${status ? 'ON' : 'OFF'}`);
        set({ rememberMe: status });
      },
        
      setPassVerified: (status) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, isPassVerified: status } : null 
        })),
    }),
    {
      name: 'boim-auth-storage',
      storage: createJSONStorage(() => hybridStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
