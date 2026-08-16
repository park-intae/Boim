import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReAuthModal } from './ReAuthModal';
import { apiClient } from '../../../api/client';
import { vi } from 'vitest';

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
});
