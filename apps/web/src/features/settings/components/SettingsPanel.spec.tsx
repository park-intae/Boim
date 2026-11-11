import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsPanel } from './SettingsPanel';
import * as userQueries from '../../../api/useUserQueries';
import * as authLogout from '../../auth/hooks/useLogout';
import { mockUser, mockNotificationSettings } from '../../../test/fixtures';

vi.mock('../../../api/useUserQueries', () => ({
  useExportData: vi.fn(),
  useImportData: vi.fn(),
  useDeleteAccount: vi.fn(),
  useGetProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
  useUpdatePassword: vi.fn(),
  useGetNotificationSettings: vi.fn(),
  useUpdateNotificationSettings: vi.fn(),
  useGetLoginHistory: vi.fn(),
}));

vi.mock('../../../api/client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      kakao: { linked: false, email: null },
      naver: { linked: false, email: null },
    }),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../auth/hooks/useLogout', () => ({
  useLogout: vi.fn(),
}));

describe('SettingsPanel Component', () => {
  const mockExportData = vi.fn();
  const mockImportData = vi.fn();
  const mockDeleteAccount = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    vi.mocked(userQueries.useExportData).mockReturnValue({
      mutateAsync: mockExportData,
    } as unknown as ReturnType<typeof userQueries.useExportData>);

    vi.mocked(userQueries.useImportData).mockReturnValue({
      mutateAsync: mockImportData,
    } as unknown as ReturnType<typeof userQueries.useImportData>);

    vi.mocked(userQueries.useDeleteAccount).mockReturnValue({
      mutateAsync: mockDeleteAccount,
    } as unknown as ReturnType<typeof userQueries.useDeleteAccount>);

    vi.mocked(authLogout.useLogout).mockReturnValue({
      logout: mockLogout,
    } as unknown as ReturnType<typeof authLogout.useLogout>);

    vi.mocked(userQueries.useGetProfile).mockReturnValue({
      data: mockUser,
    } as unknown as ReturnType<typeof userQueries.useGetProfile>);

    vi.mocked(userQueries.useUpdateProfile).mockReturnValue({
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof userQueries.useUpdateProfile>);

    vi.mocked(userQueries.useUpdatePassword).mockReturnValue({
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof userQueries.useUpdatePassword>);

    vi.mocked(userQueries.useGetNotificationSettings).mockReturnValue({
      data: mockNotificationSettings,
    } as unknown as ReturnType<typeof userQueries.useGetNotificationSettings>);

    vi.mocked(userQueries.useUpdateNotificationSettings).mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof userQueries.useUpdateNotificationSettings>);

    vi.mocked(userQueries.useGetLoginHistory).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof userQueries.useGetLoginHistory>);
  });

  it('renders main settings menus', () => {
    render(<SettingsPanel />);

    expect(screen.getByText('설정')).toBeInTheDocument();
    expect(screen.getByText('내 프로필 관리')).toBeInTheDocument();
    expect(screen.getByText('비밀번호 변경')).toBeInTheDocument();
    expect(screen.getByText('소셜 계정 연동')).toBeInTheDocument();
    expect(screen.getByText('로그인 기기 관리')).toBeInTheDocument();
    expect(screen.getByText('데이터 내보내기')).toBeInTheDocument();
    expect(screen.getByText('데이터 가져오기')).toBeInTheDocument();
    expect(screen.getByText('계정 탈퇴')).toBeInTheDocument();
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
    expect(screen.getByText('이용약관')).toBeInTheDocument();
    expect(screen.getByText('개인정보처리방침')).toBeInTheDocument();
  });

  it('navigates to profile settings and returns to menu', () => {
    render(<SettingsPanel />);
    fireEvent.click(screen.getByText('내 프로필 관리'));
    expect(screen.getByText('내 정보 관리')).toBeInTheDocument();

    const backBtn = screen.getAllByRole('button')[0];
    fireEvent.click(backBtn);
    expect(screen.getByText('내 프로필 관리')).toBeInTheDocument();
  });

  it('navigates to password settings and returns to menu', () => {
    render(<SettingsPanel />);
    fireEvent.click(screen.getByText('비밀번호 변경'));
    expect(screen.getByText('현재 비밀번호')).toBeInTheDocument();

    const backBtn = screen.getAllByRole('button')[0];
    fireEvent.click(backBtn);
    expect(screen.getByText('비밀번호 변경')).toBeInTheDocument();
  });

  it('navigates to social accounts view and returns to menu', () => {
    render(<SettingsPanel />);
    fireEvent.click(screen.getByText('소셜 계정 연동'));
    expect(screen.getByRole('heading', { name: '소셜 계정 연동' })).toBeInTheDocument();

    const backBtn = screen.getAllByRole('button')[0];
    fireEvent.click(backBtn);
    expect(screen.getByText('소셜 계정 연동')).toBeInTheDocument();
  });

  it('navigates to login history view and returns to menu', () => {
    render(<SettingsPanel />);
    fireEvent.click(screen.getByText('로그인 기기 관리'));
    expect(screen.getByText('로그인 기록')).toBeInTheDocument();

    const backBtn = screen.getAllByRole('button')[0];
    fireEvent.click(backBtn);
    expect(screen.getByText('로그인 기기 관리')).toBeInTheDocument();
  });

  it('navigates to terms and privacy views', () => {
    render(<SettingsPanel />);
    fireEvent.click(screen.getByText('이용약관'));
    expect(screen.getByText(/본 약관은 Boim 서비스의 이용과 관련하여/)).toBeInTheDocument();

    let backBtn = screen.getAllByRole('button')[0];
    fireEvent.click(backBtn);

    fireEvent.click(screen.getByText('개인정보처리방침'));
    expect(screen.getByText(/Boim은 다음의 목적을 위하여 개인정보를 처리합니다/)).toBeInTheDocument();

    backBtn = screen.getAllByRole('button')[0];
    fireEvent.click(backBtn);
    expect(screen.getByText('개인정보처리방침')).toBeInTheDocument();
  });

  it('triggers data export on button click', async () => {
    mockExportData.mockResolvedValueOnce({ users: [mockUser] });
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(<SettingsPanel />);
    fireEvent.click(screen.getByText('데이터 내보내기'));

    await waitFor(() => {
      expect(mockExportData).toHaveBeenCalled();
    });

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('handles account deletion when confirmed', async () => {
    mockDeleteAccount.mockResolvedValueOnce({ success: true });
    render(<SettingsPanel />);

    fireEvent.click(screen.getByText('계정 탈퇴'));

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('계정이 탈퇴되었습니다.');
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('handles logout button click', async () => {
    render(<SettingsPanel />);
    fireEvent.click(screen.getByText('로그아웃'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
