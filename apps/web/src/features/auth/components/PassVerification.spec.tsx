import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PassVerification } from './PassVerification';
import { apiClient } from '../../../api/client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

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
    
    // 1. Mock request phase
    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      data: { transactionId: 'tx-123' },
    });
    
    render(
      <BrowserRouter>
        <PassVerification onVerifySuccess={mockOnVerifySuccess} />
      </BrowserRouter>
    );
    
    const phoneInput = screen.getByPlaceholderText('휴대폰 번호 (- 없이 입력)');
    fireEvent.change(phoneInput, { target: { value: '01012345678' } });
    fireEvent.click(screen.getByRole('button', { name: '인증번호 요청' }));
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/pass/request', { phoneNumber: '01012345678' });
    });
    
    // 2. Mock verify phase
    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      message: 'PASS 본인인증이 완료되었습니다.',
    });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('인증번호 6자리 (테스트: 000000)')).toBeInTheDocument();
    });
    
    const codeInput = screen.getByPlaceholderText('인증번호 6자리 (테스트: 000000)');
    fireEvent.change(codeInput, { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: '인증 확인' }));
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/pass/verify', { transactionId: 'tx-123', code: '000000' });
    });
  });
});
