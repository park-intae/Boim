import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OAuthCallbackPage } from './OAuthCallbackPage';
import { apiClient } from '../api/client';
import { useAuthStore } from '../features/auth/store/authStore';

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}));

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../features/auth/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('OAuthCallbackPage', () => {
  let mockLogin: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin = vi.fn();
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({ login: mockLogin }),
    );
  });

  it('renders loading state initially', () => {
    mockSearchParams = new URLSearchParams('token=sample_jwt_token');
    render(<OAuthCallbackPage />);
    expect(screen.getByText('소셜 로그인 확인 중')).toBeInTheDocument();
  });

  it('handles token in URL parameters and logs in successfully', async () => {
    mockSearchParams = new URLSearchParams('token=sample_jwt_token');

    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: '1',
          email: 'kakao@boim.com',
          name: '카카오사용자',
          isPassVerified: true,
        },
      },
    });

    render(<OAuthCallbackPage />);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        {
          id: '1',
          email: 'kakao@boim.com',
          name: '카카오사용자',
          profileImage: null,
          isPassVerified: true,
        },
        'sample_jwt_token',
      );
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('handles error in URL parameters and displays error message with return button', async () => {
    mockSearchParams = new URLSearchParams('error=access_denied&error_description=사용자가+취소함');
    render(<OAuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText('소셜 로그인 실패')).toBeInTheDocument();
      expect(screen.getByText('사용자가 취소함')).toBeInTheDocument();
    });

    const returnBtn = screen.getByRole('button', { name: /로그인 화면으로 복귀/i });
    fireEvent.click(returnBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('handles authorization code in URL and exchanges for tokens', async () => {
    mockSearchParams = new URLSearchParams('code=auth_code_123');

    (apiClient.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          user: {
            id: '10',
            email: 'code_user@boim.com',
            name: '코드유저',
            isPassVerified: false,
          },
          tokens: {
            accessToken: 'issued_jwt_access',
          },
        },
      },
    });

    render(<OAuthCallbackPage />);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/kakao/login', {
        code: 'auth_code_123',
      });
      expect(mockLogin).toHaveBeenCalledWith(
        {
          id: '10',
          email: 'code_user@boim.com',
          name: '코드유저',
          profileImage: null,
          isPassVerified: false,
        },
        'issued_jwt_access',
      );
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('shows error notice when no valid params are provided', async () => {
    mockSearchParams = new URLSearchParams('');
    render(<OAuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText('소셜 로그인 실패')).toBeInTheDocument();
      expect(
        screen.getByText('유효한 소셜 인증 정보가 전달되지 않았습니다.'),
      ).toBeInTheDocument();
    });
  });
});
