import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

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
    if (local) return local;
    return sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const parsed = JSON.parse(value);
      if (parsed?.state?.rememberMe) {
        localStorage.setItem(name, value);
        sessionStorage.removeItem(name);
      } else {
        sessionStorage.setItem(name, value);
        localStorage.removeItem(name);
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
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      rememberMe: false,

      login: (user, token) => 
        set({ user, accessToken: token, isAuthenticated: true }),
        
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false, rememberMe: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('boim-auth-storage');
          sessionStorage.removeItem('boim-auth-storage');
        }
      },
        
      setRememberMe: (status) => 
        set({ rememberMe: status }),
        
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
