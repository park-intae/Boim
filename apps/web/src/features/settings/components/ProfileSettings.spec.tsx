import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileSettings } from './ProfileSettings';
import * as userQueries from '../../../api/useUserQueries';
import { mockUser } from '../../../test/fixtures';

vi.mock('../../../api/useUserQueries', () => ({
  useGetProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
}));

describe('ProfileSettings Component', () => {
  const mockOnBack = vi.fn();
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(userQueries.useGetProfile).mockReturnValue({
      data: mockUser,
    } as unknown as ReturnType<typeof userQueries.useGetProfile>);
    vi.mocked(userQueries.useUpdateProfile).mockReturnValue({
      mutateAsync: mockUpdateProfile,
    } as unknown as ReturnType<typeof userQueries.useUpdateProfile>);
  });

  it('renders user email (disabled) and current name', () => {
    render(<ProfileSettings onBack={mockOnBack} />);

    expect(screen.getByText('내 정보 관리')).toBeInTheDocument();
    const emailInput = screen.getByDisplayValue(mockUser.email);
    expect(emailInput).toBeDisabled();

    const nameInput = screen.getByDisplayValue(mockUser.name);
    expect(nameInput).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: '저장하기' });
    expect(submitBtn).toBeDisabled();
  });

  it('calls onBack when back button is clicked', () => {
    render(<ProfileSettings onBack={mockOnBack} />);
    const backBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(backBtn);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('enables save button when name is changed and disabled when name is empty', () => {
    render(<ProfileSettings onBack={mockOnBack} />);
    const nameInput = screen.getByDisplayValue(mockUser.name);
    const submitBtn = screen.getByRole('button', { name: '저장하기' });

    fireEvent.change(nameInput, { target: { value: '김철수' } });
    expect(submitBtn).toBeEnabled();

    fireEvent.change(nameInput, { target: { value: '   ' } });
    expect(submitBtn).toBeDisabled();
  });

  it('submits name update successfully and calls alert and onBack', async () => {
    mockUpdateProfile.mockResolvedValueOnce({ success: true });
    render(<ProfileSettings onBack={mockOnBack} />);

    const nameInput = screen.getByDisplayValue(mockUser.name);
    fireEvent.change(nameInput, { target: { value: '홍길순' } });

    const submitBtn = screen.getByRole('button', { name: '저장하기' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({ name: '홍길순' });
      expect(window.alert).toHaveBeenCalledWith('프로필이 성공적으로 업데이트되었습니다.');
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error alert on update failure', async () => {
    mockUpdateProfile.mockRejectedValueOnce(new Error('Update failed'));
    render(<ProfileSettings onBack={mockOnBack} />);

    const nameInput = screen.getByDisplayValue(mockUser.name);
    fireEvent.change(nameInput, { target: { value: '홍길순' } });

    const submitBtn = screen.getByRole('button', { name: '저장하기' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('프로필 업데이트에 실패했습니다.');
    });
  });
});
