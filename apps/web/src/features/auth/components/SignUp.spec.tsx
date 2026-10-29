import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SignUp } from './SignUp';
import { apiClient } from '../../../api/client';

vi.mock('../../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
  };
});

describe('SignUp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign up form fields correctly', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('홍길동')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('example@boim.com')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
  });

  it('submits form and calls register api, then navigates to /pass-verify', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      data: {
        accessToken: 'mock_signup_token',
        user: {
          id: '10',
          email: 'newuser@boim.com',
          name: '새사용자',
          isPassVerified: false,
        },
      },
    });

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('홍길동'), {
      target: { value: '새사용자' },
    });
    fireEvent.change(screen.getByPlaceholderText('example@boim.com'), {
      target: { value: 'newuser@boim.com' },
    });
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    const submitBtn = screen.getByRole('button', { name: '회원가입' });
    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        name: '새사용자',
        email: 'newuser@boim.com',
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/pass-verify', { replace: true });
    });
  });
});
