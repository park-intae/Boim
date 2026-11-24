import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReAuthModal } from './ReAuthModal';
import { apiClient } from '../../../api/client';

vi.mock('../../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('ReAuthModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<ReAuthModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.queryByText('재인증 필요')).not.toBeInTheDocument();
  });

  it('renders and calls backend reauth API successfully', async () => {
    const mockOnSuccess = vi.fn();
    (apiClient.post as any).mockResolvedValueOnce({ success: true });
    
    render(<ReAuthModal isOpen={true} onClose={vi.fn()} onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('비밀번호 입력'), { target: { value: 'correct_password' } });
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/reauth', { password: 'correct_password' });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('displays error message when reauth fails', async () => {
    (apiClient.post as any).mockResolvedValueOnce({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    
    render(<ReAuthModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    
    fireEvent.change(screen.getByPlaceholderText('비밀번호 입력'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
    });
  });

  it('비밀번호를 입력하지 않고 제출하면 안내 에러를 표시하고 API를 호출하지 않아야 한다.', async () => {
    render(<ReAuthModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    const form = screen.getByPlaceholderText('비밀번호 입력').closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('API 요청이 reject되면 에러 메시지를 표시해야 한다.', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      error: { message: '재인증 서버 오류가 발생했습니다.' },
    });

    render(<ReAuthModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('비밀번호 입력'), {
      target: { value: 'password123' },
    });
    const form = screen.getByPlaceholderText('비밀번호 입력').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('재인증 서버 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });

  it('취소 버튼 클릭 시 onClose가 호출되어야 한다.', () => {
    const mockOnClose = vi.fn();
    render(<ReAuthModal isOpen={true} onClose={mockOnClose} onSuccess={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
