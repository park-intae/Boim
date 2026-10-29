import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SocialAccountsSettings } from './SocialAccountsSettings';
import { apiClient } from '../../../api/client';

/* =========================================================================
 * 🚀 [PROD 전용 실제 OAuth2 연동 테스트 전환 가이드]
 * 실제 카카오 SDK(Kakao.Auth) 또는 네이버 로그인 SDK 연동 시:
 * 
 * 1) 카카오 공식 SDK 모킹 예시:
 *    window.Kakao = {
 *      init: vi.fn(),
 *      isInitialized: vi.fn().mockReturnValue(true),
 *      Auth: {
 *        authorize: vi.fn(),
 *        login: vi.fn(({ success }) => success({ access_token: 'mock_kakao_token' })),
 *      },
 *    };
 * 
 * 2) 네이버 LoginWithNaverId SDK 모킹 예시:
 *    window.naver = {
 *      LoginWithNaverId: vi.fn().mockImplementation(() => ({
 *        init: vi.fn(),
 *        getLoginStatus: vi.fn((cb) => cb(true)),
 *      })),
 *    };
 * 
 * 3) OAuth 리다이렉트 URL 이동 검증 시:
 *    delete (window as any).location;
 *    window.location = { href: '' } as any;
 *    expect(window.location.href).toContain('/auth/kakao?mode=link');
 * ========================================================================= */

vi.mock('../../../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('SocialAccountsSettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders social link status and allows mock linking', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      kakao: { linked: false, email: null },
      naver: { linked: true, email: 'test@naver.com' },
    });

    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      message: '카카오 계정이 간이로 성공적으로 연동되었습니다.',
    });

    render(<SocialAccountsSettings onBack={vi.fn()} />);

    // 로딩 완료 대기
    await waitFor(() => {
      expect(screen.getByText('카카오')).toBeInTheDocument();
      expect(screen.getByText('네이버')).toBeInTheDocument();
    });

    expect(screen.getByText('미연동')).toBeInTheDocument();
    expect(screen.getByText('연동됨')).toBeInTheDocument();
    expect(screen.getByText('test@naver.com')).toBeInTheDocument();

    // 카카오 간이 연동하기 클릭 (추후 공식 SDK 버튼 삽입 시 해당 버튼 클릭 테스트로 대체)
    const linkBtn = screen.getByRole('button', { name: '연동하기' });
    fireEvent.click(linkBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/social/mock-link', { provider: 'kakao' });
    });
  });

  it('allows mock unlinking of a connected social account', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      kakao: { linked: true, email: 'test@kakao.com' },
      naver: { linked: false, email: null },
    });

    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      message: '카카오 계정 연동이 해제되었습니다.',
    });

    render(<SocialAccountsSettings onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('test@kakao.com')).toBeInTheDocument();
    });

    // 연동 해제 버튼 클릭 (실제 연동 해제 API 호출 시에도 동일한 액션 트리거)
    const unlinkBtn = screen.getByRole('button', { name: '해제' });
    fireEvent.click(unlinkBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/social/mock-unlink', { provider: 'kakao' });
    });
  });
});
