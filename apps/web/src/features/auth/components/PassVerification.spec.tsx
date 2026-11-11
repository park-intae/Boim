import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PassVerification } from './PassVerification';
import { apiClient } from '../../../api/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('PassVerification Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('인증번호 요청 후 3분 타이머가 표시되고 정상적으로 인증 완료 플로우를 거쳐야 한다', async () => {
    const mockOnVerifySuccess = vi.fn();

    // 1. Mock request phase
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { transactionId: 'PASS_TX_123' },
    });

    render(
      <BrowserRouter>
        <PassVerification onVerifySuccess={mockOnVerifySuccess} />
      </BrowserRouter>,
    );

    const phoneInput = screen.getByPlaceholderText('휴대폰 번호 (- 없이 입력)');
    fireEvent.change(phoneInput, { target: { value: '01012345678' } });
    fireEvent.click(screen.getByRole('button', { name: '인증번호 요청' }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/pass/request', {
        phoneNumber: '01012345678',
      });
      expect(screen.getByText('03:00')).toBeDefined();
    });

    // 2. Mock verify phase
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      message: 'PASS 본인인증이 완료되었습니다.',
    });

    const codeInput = screen.getByPlaceholderText('인증번호 6자리');
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: '인증 확인' }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/pass/verify', {
        transactionId: 'PASS_TX_123',
        code: '123456',
      });
    });
  });

  it('인증번호 재전송 클릭 시 다시 요청 API를 호출하고 타이머를 리셋해야 한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { transactionId: 'PASS_TX_FIRST' },
    });

    render(
      <BrowserRouter>
        <PassVerification onVerifySuccess={vi.fn()} />
      </BrowserRouter>,
    );

    const phoneInput = screen.getByPlaceholderText('휴대폰 번호 (- 없이 입력)');
    fireEvent.change(phoneInput, { target: { value: '01099998888' } });
    fireEvent.click(screen.getByRole('button', { name: '인증번호 요청' }));

    await waitFor(() => {
      expect(screen.getByText('인증번호 재전송')).toBeDefined();
    });

    // 재전송 Mock
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { transactionId: 'PASS_TX_SECOND' },
    });

    const resendBtn = screen.getByRole('button', { name: /인증번호 재전송/i });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledTimes(2);
      expect(screen.getByText('03:00')).toBeDefined();
    });
  });

  it('3분(180초) 경과 시 타이머가 00:00이 되고 입력 및 확인 버튼이 비활성화되어야 한다', async () => {
    vi.useFakeTimers();

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { transactionId: 'PASS_TX_EXPIRE_TEST' },
    });

    render(
      <BrowserRouter>
        <PassVerification onVerifySuccess={vi.fn()} />
      </BrowserRouter>,
    );

    const phoneInput = screen.getByPlaceholderText('휴대폰 번호 (- 없이 입력)');
    fireEvent.change(phoneInput, { target: { value: '01011112222' } });
    fireEvent.click(screen.getByRole('button', { name: '인증번호 요청' }));

    await vi.advanceTimersByTimeAsync(100);

    // 180초 카운트다운 진행
    await act(async () => {
      await vi.advanceTimersByTimeAsync(180 * 1000);
    });

    expect(screen.getByText('00:00')).toBeDefined();
    const codeInput = screen.getByPlaceholderText('인증시간 만료');
    expect(codeInput).toBeDisabled();

    const verifyBtn = screen.getByRole('button', { name: '인증 확인' });
    expect(verifyBtn).toBeDisabled();
  });
});
