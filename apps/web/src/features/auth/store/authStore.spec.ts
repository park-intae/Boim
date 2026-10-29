import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('useAuthStore & hybridStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.getState().logout();
  });

  it('stores auth state in sessionStorage when rememberMe is false', () => {
    useAuthStore.getState().setRememberMe(false);
    useAuthStore.getState().login(
      { id: 'user_1', email: 'test@boim.com', isPassVerified: false },
      'mock_token_session'
    );

    const sessionData = sessionStorage.getItem('boim-auth-storage');
    const localData = localStorage.getItem('boim-auth-storage');

    expect(sessionData).toBeTruthy();
    expect(localData).toBeNull();

    const parsed = JSON.parse(sessionData!);
    expect(parsed.state.user.email).toBe('test@boim.com');
    expect(parsed.state.accessToken).toBe('mock_token_session');
    expect(parsed.state.rememberMe).toBe(false);
  });

  it('stores auth state in localStorage when rememberMe is true', () => {
    useAuthStore.getState().setRememberMe(true);
    useAuthStore.getState().login(
      { id: 'user_2', email: 'remember@boim.com', isPassVerified: true },
      'mock_token_local'
    );

    const sessionData = sessionStorage.getItem('boim-auth-storage');
    const localData = localStorage.getItem('boim-auth-storage');

    expect(localData).toBeTruthy();
    expect(sessionData).toBeNull();

    const parsed = JSON.parse(localData!);
    expect(parsed.state.user.email).toBe('remember@boim.com');
    expect(parsed.state.accessToken).toBe('mock_token_local');
    expect(parsed.state.rememberMe).toBe(true);
  });

  it('clears both localStorage and sessionStorage on logout', () => {
    useAuthStore.getState().setRememberMe(true);
    useAuthStore.getState().login(
      { id: 'user_3', email: 'logout@boim.com', isPassVerified: false },
      'mock_token'
    );

    expect(localStorage.getItem('boim-auth-storage')).toBeTruthy();

    useAuthStore.getState().logout();

    expect(localStorage.getItem('boim-auth-storage')).toBeNull();
    expect(sessionStorage.getItem('boim-auth-storage')).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
