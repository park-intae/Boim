import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './Login';
import { apiClient } from '../../../api/client';
import { vi } from 'vitest';

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
});
