import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SocialAccountsSettings } from './SocialAccountsSettings';
import { apiClient } from '../../../api/client';
import { useAuthStore } from '../../auth/store/authStore';

vi.mock('../../../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('SocialAccountsSettings Component', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    delete (window as any).location;
    window.location = {
      ...originalLocation,
      href: 'http://localhost:3000/',
      pathname: '/',
      search: '',
      port: '3000',
    } as any;

    useAuthStore.setState({
      user: {
        id: '1',
        email: 'test@boim.com',
        name: '테스트유저',
        profileImage: null,
        isPassVerified: true,
      },
      accessToken: 'mock_jwt_token',
      isAuthenticated: true,
    });
  });

  it('renders social link status and initiates real OAuth linking redirect', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      primaryAccountProvider: 'local',
      localAccount: { email: 'test@boim.com', nickname: '테스트유저' },
      kakao: { linked: false, email: null, nickname: null, profileImage: null },
      naver: { linked: true, email: 'test@naver.com', nickname: '네이버유저', profileImage: null },
      preferredImageProvider: 'kakao',
      preferredNameProvider: 'kakao',
    });

    render(<SocialAccountsSettings onBack={vi.fn()} />);

    // 로딩 완료 대기
    await waitFor(() => {
      expect(screen.getByText('대표 본계정(Primary Account)')).toBeInTheDocument();
      expect(screen.getByText('기본 가입 계정')).toBeInTheDocument();
      expect(screen.getByText('네이버 계정')).toBeInTheDocument();
      expect(screen.getByText('현재 본계정')).toBeInTheDocument();
    });

    expect(screen.getByText('미연동')).toBeInTheDocument();
    expect(screen.getByText('연동됨')).toBeInTheDocument();
    expect(screen.getByText('test@naver.com')).toBeInTheDocument();

    // 카카오 연동하기 클릭
    const linkBtn = screen.getByRole('button', { name: '연동하기' });
    fireEvent.click(linkBtn);

    expect(window.location.href).toContain('/auth/social/link/kakao?token=mock_jwt_token');
  });

  it('allows switching primary account from local to naver', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      primaryAccountProvider: 'local',
      localAccount: { email: 'test@boim.com', nickname: '테스트유저' },
      kakao: { linked: false, email: null, nickname: null, profileImage: null },
      naver: { linked: true, email: 'test@naver.com', nickname: '네이버라인', profileImage: 'https://naver.com/line.jpg' },
      preferredImageProvider: 'default',
      preferredNameProvider: 'custom',
    });

    (apiClient.patch as any).mockResolvedValueOnce({
      id: '1',
      name: '네이버라인',
      profileImage: 'https://naver.com/line.jpg',
      primaryAccountProvider: 'naver',
      preferredImageProvider: 'naver',
      preferredNameProvider: 'naver',
    });

    render(<SocialAccountsSettings onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('네이버라인')).toBeInTheDocument();
    });

    // 네이버 계정의 '본계정으로 지정' 버튼 클릭
    const switchBtn = screen.getByRole('button', { name: '본계정으로 지정' });
    fireEvent.click(switchBtn);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith('/auth/social/primary-account', {
        primaryAccountProvider: 'naver',
      });
    });

    // authStore 상태 동기화 확인
    expect(useAuthStore.getState().user?.name).toBe('네이버라인');
    expect(useAuthStore.getState().user?.profileImage).toBe('https://naver.com/line.jpg');
  });

  it('allows real unlinking of a connected social account', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      primaryAccountProvider: 'local',
      localAccount: { email: 'test@boim.com', nickname: '테스트유저' },
      kakao: { linked: true, email: 'test@kakao.com', nickname: '카카오유저', profileImage: null },
      naver: { linked: false, email: null, nickname: null, profileImage: null },
      preferredImageProvider: 'kakao',
      preferredNameProvider: 'kakao',
    });

    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      message: '카카오 계정 연동이 해제되었습니다.',
    });

    render(<SocialAccountsSettings onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('test@kakao.com')).toBeInTheDocument();
    });

    // 연동 해제 버튼 클릭
    const unlinkBtn = screen.getByRole('button', { name: '해제' });
    fireEvent.click(unlinkBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/kakao/unlink');
    });
  });

  it('displays success alert when returning with social_link_success parameter', async () => {
    window.location.search = '?social_link_success=kakao';
    const alertSpy = vi.spyOn(window, 'alert');

    (apiClient.get as any).mockResolvedValueOnce({
      primaryAccountProvider: 'local',
      localAccount: { email: 'test@boim.com', nickname: '테스트유저' },
      kakao: { linked: true, email: 'test@kakao.com', nickname: '카카오유저', profileImage: null },
      naver: { linked: false, email: null, nickname: null, profileImage: null },
      preferredImageProvider: 'kakao',
      preferredNameProvider: 'kakao',
    });

    render(<SocialAccountsSettings onBack={vi.fn()} />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('카카오 계정이 성공적으로 연동되었습니다!');
    });
  });
});
