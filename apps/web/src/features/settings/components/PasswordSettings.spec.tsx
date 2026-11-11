import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PasswordSettings } from './PasswordSettings';
import * as userQueries from '../../../api/useUserQueries';

vi.mock('../../../api/useUserQueries', () => ({
  useUpdatePassword: vi.fn(),
}));

describe('PasswordSettings Component', () => {
  const mockOnBack = vi.fn();
  const mockUpdatePassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(userQueries.useUpdatePassword).mockReturnValue({
      mutateAsync: mockUpdatePassword,
    } as unknown as ReturnType<typeof userQueries.useUpdatePassword>);
  });

  it('renders all password input fields and disabled submit button initially', () => {
    render(<PasswordSettings onBack={mockOnBack} />);

    expect(screen.getByText('비밀번호 변경')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('현재 비밀번호를 입력해주세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('영문, 숫자, 특수문자 조합 8자 이상')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('새 비밀번호를 다시 입력해주세요')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: '비밀번호 변경하기' });
    expect(submitBtn).toBeDisabled();
  });

  it('calls onBack when back button is clicked', () => {
    render(<PasswordSettings onBack={mockOnBack} />);
    const backBtn = screen.getAllByRole('button')[0];
    fireEvent.click(backBtn);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('toggles password visibility when eye button is clicked', () => {
    render(<PasswordSettings onBack={mockOnBack} />);
    const currentInput = screen.getByPlaceholderText('현재 비밀번호를 입력해주세요') as HTMLInputElement;
    expect(currentInput.type).toBe('password');

    // Toggle button next to current password
    const toggleButtons = screen.getAllByRole('button');
    // First button is back button, 2nd is toggle for current
    fireEvent.click(toggleButtons[1]);
    expect(currentInput.type).toBe('text');

    fireEvent.click(toggleButtons[1]);
    expect(currentInput.type).toBe('password');
  });

  it('shows error message when new password and confirm password do not match', () => {
    render(<PasswordSettings onBack={mockOnBack} />);

    fireEvent.change(screen.getByPlaceholderText('현재 비밀번호를 입력해주세요'), {
      target: { value: 'current123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('영문, 숫자, 특수문자 조합 8자 이상'), {
      target: { value: 'newpassword123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('새 비밀번호를 다시 입력해주세요'), {
      target: { value: 'different123!' },
    });

    expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '비밀번호 변경하기' })).toBeDisabled();
  });

  it('submits successfully when form is valid and triggers alert & onBack', async () => {
    mockUpdatePassword.mockResolvedValueOnce({ success: true });
    render(<PasswordSettings onBack={mockOnBack} />);

    fireEvent.change(screen.getByPlaceholderText('현재 비밀번호를 입력해주세요'), {
      target: { value: 'current123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('영문, 숫자, 특수문자 조합 8자 이상'), {
      target: { value: 'newpassword123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('새 비밀번호를 다시 입력해주세요'), {
      target: { value: 'newpassword123!' },
    });

    const submitBtn = screen.getByRole('button', { name: '비밀번호 변경하기' });
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith({
        currentPassword: 'current123!',
        newPassword: 'newpassword123!',
      });
      expect(window.alert).toHaveBeenCalledWith('비밀번호가 성공적으로 변경되었습니다.');
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  it('shows failure alert when update password throws an error', async () => {
    mockUpdatePassword.mockRejectedValueOnce(new Error('Update failed'));
    render(<PasswordSettings onBack={mockOnBack} />);

    fireEvent.change(screen.getByPlaceholderText('현재 비밀번호를 입력해주세요'), {
      target: { value: 'wrong123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('영문, 숫자, 특수문자 조합 8자 이상'), {
      target: { value: 'newpassword123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('새 비밀번호를 다시 입력해주세요'), {
      target: { value: 'newpassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: '비밀번호 변경하기' }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
    });
  });
});
