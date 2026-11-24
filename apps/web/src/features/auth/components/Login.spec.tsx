import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Login } from './Login';
import { apiClient } from '../../../api/client';

vi.mock('../../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

// react-router-dom mock for useSearchParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useSearchParams: () => [new URLSearchParams()],
    useNavigate: () => vi.fn(),
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    expect(screen.getByPlaceholderText('example@boim.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('submits form and calls login api', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      data: { accessToken: 'mock_token' },
    });
    
    render(<BrowserRouter><Login /></BrowserRouter>);
    const emailInput = screen.getByPlaceholderText('example@boim.com') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    const pwInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    fireEvent.change(pwInput, { target: { value: 'password123' } });
    
    const submitBtn = screen.getByRole('button', { name: '로그인' });
    fireEvent.submit(submitBtn.closest('form')!);
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password123',
        rememberMe: false,
      });
    });
  });

  it('logs in immediately via demo fallback when email is demo@boim.com without calling backend api', async () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    const emailInput = screen.getByPlaceholderText('example@boim.com') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'demo@boim.com' } });
    const pwInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    fireEvent.change(pwInput, { target: { value: 'demo' } });

    const submitBtn = screen.getByRole('button', { name: '로그인' });
    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => {
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  it('잘못된 이메일 형식과 8자 미만 비밀번호 제출 시 유효성 에러를 표시하고 API를 호출하지 않는다', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('example@boim.com'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '1234' },
    });

    const submitBtn = screen.getByRole('button', { name: '로그인' });
    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요.')).toBeInTheDocument();
      expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다.')).toBeInTheDocument();
    });
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('로그인 API 요청이 실패하면 에러 메시지를 alert로 표시한다', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      error: { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('example@boim.com'), {
      target: { value: 'user@boim.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    const submitBtn = screen.getByRole('button', { name: '로그인' });
    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('이메일 또는 비밀번호가 올바르지 않습니다.');
    });
    alertSpy.mockRestore();
  });
});
