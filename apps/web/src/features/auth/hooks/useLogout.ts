import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../../../api/client';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      // 백엔드 로그아웃 API 호출 (토큰 무효화 및 리프레시 토큰 정리)
      await apiClient.post('/auth/logout');
    } catch (error) {
      // API 실패하더라도 클라이언트 로그아웃은 정상 처리
      console.error('Logout API failed:', error);
    } finally {
      // Zustand 스토어 정리
      logout();
      try {
        localStorage.removeItem('boim-auth-storage');
        sessionStorage.removeItem('boim-auth-storage');
      } catch {
        // 스토리지 접근 예외 무시
      }
      // TanStack Query 캐시 초기화
      queryClient.clear();
      // 로그인 페이지로 이동
      navigate('/login', { replace: true });
    }
  };

  return { logout: handleLogout };
}
