import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  isPassVerified: boolean;
}

interface AuthState {
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      rememberMe: false,

      login: (user, token) => 
        set({ user, accessToken: token, isAuthenticated: true }),
        
      logout: () => 
        set({ user: null, accessToken: null, isAuthenticated: false }),
        
      setRememberMe: (status) => 
        set({ rememberMe: status }),
        
      setPassVerified: (status) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, isPassVerified: status } : null 
        })),
    }),
    {
      name: 'boim-auth-storage', // localStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 기기 기억이 true일 때만 로컬 스토리지에 토큰과 유저 정보 저장
        // false일 경우에는 상태만 초기화 시 유지하도록 설계
        rememberMe: state.rememberMe,
        ...(state.rememberMe && {
          user: state.user,
          accessToken: state.accessToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }),
    }
  )
);
