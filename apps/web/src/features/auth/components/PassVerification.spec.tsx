import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PassVerification } from './PassVerification';
import { apiClient } from '../../../api/client';
import { vi } from 'vitest';

vi.mock('../../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('PassVerification Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles request and verify flow correctly', async () => {
    const mockOnVerifySuccess = vi.fn();
    
    // Mock the request phase
    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      data: { transactionId: 'tx-123' },
    });
    
    render(<PassVerification onVerifySuccess={mockOnVerifySuccess} />);
    
    // 1. Request phase
    const phoneInput = screen.getByPlaceholderText('010-0000-0000');
    fireEvent.change(phoneInput, { target: { value: '01012345678' } });
    fireEvent.click(screen.getByRole('button', { name: '인증 요청하기' }));
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/pass/request', { phoneNumber: '01012345678' });
    });
    
    // 2. Mock the verify phase
    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      message: 'PASS 본인인증이 완료되었습니다.',
    });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });
    
    const codeInput = screen.getByPlaceholderText('000000');
    fireEvent.change(codeInput, { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: '인증 완료하기' }));
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/pass/verify', { transactionId: 'tx-123', code: '000000' });
      // We expect the success mock text to appear eventually
      expect(screen.getByText('인증이 완료되었습니다!')).toBeInTheDocument();
    });
  });
});
