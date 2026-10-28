import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLogout } from './useLogout';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../../../api/client';

const mockNavigate = vi.fn();
const mockClearQuery = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    clear: mockClearQuery,
  }),
}));

vi.mock('../../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('useLogout hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'user1', email: 'user@test.com', isPassVerified: true },
      accessToken: 'token123',
      isAuthenticated: true,
      rememberMe: true,
    });
  });

  it('successfully logs out, clears store and query cache, and navigates to /login', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: true,
      data: { message: '로그아웃되었습니다.' },
    });

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    // 1. API 호출 검증
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');

    // 2. Zustand 스토어 상태 초기화 검증
    const authState = useAuthStore.getState();
    expect(authState.user).toBeNull();
    expect(authState.accessToken).toBeNull();
    expect(authState.isAuthenticated).toBe(false);

    // 3. React Query 캐시 초기화 검증
    expect(mockClearQuery).toHaveBeenCalled();

    // 4. 로그인 페이지로 이동 검증
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('clears state and navigates even if logout API fails', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    const authState = useAuthStore.getState();
    expect(authState.user).toBeNull();
    expect(authState.accessToken).toBeNull();
    expect(authState.isAuthenticated).toBe(false);
    expect(mockClearQuery).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
