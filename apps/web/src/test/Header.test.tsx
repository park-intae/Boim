import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '../components/layout/Header';
import { useAuthStore } from '../features/auth/store/authStore';
import { useAppStore } from '../store/useAppStore';

const mockLogout = vi.fn();
vi.mock('../features/auth/hooks/useLogout', () => ({
  useLogout: () => ({
    logout: mockLogout,
  }),
}));

describe('Header component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: '1', email: 'test@boim.com', name: '홍길동', isPassVerified: true },
      accessToken: 'token123',
      isAuthenticated: true,
      rememberMe: false,
    });
    useAppStore.setState({
      panelMode: 'view',
    });
  });

  it('renders user name and initial correctly', () => {
    render(<Header />);
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('홍')).toBeInTheDocument();
  });

  it('opens profile dropdown menu on click', () => {
    render(<Header />);
    const profileBtn = screen.getByLabelText('사용자 메뉴');
    fireEvent.click(profileBtn);

    expect(screen.getByText('test@boim.com')).toBeInTheDocument();
    expect(screen.getByText('인증완료')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /환경 설정/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그아웃/i })).toBeInTheDocument();
  });

  it('calls logout when logout button in dropdown is clicked and confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<Header />);
    const profileBtn = screen.getByLabelText('사용자 메뉴');
    fireEvent.click(profileBtn);

    const logoutBtn = screen.getByRole('button', { name: /로그아웃/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('정말 로그아웃 하시겠습니까?');
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('switches to settings panel when settings button is clicked', () => {
    render(<Header />);
    const profileBtn = screen.getByLabelText('사용자 메뉴');
    fireEvent.click(profileBtn);

    const settingsBtn = screen.getByRole('button', { name: /환경 설정/i });
    fireEvent.click(settingsBtn);

    expect(useAppStore.getState().panelMode).toBe('settings');
  });
});
