import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationSettingsSection } from './NotificationSettingsSection';
import * as webNotification from '../../../shared/utils/webNotification';

const mockUpdateSettings = vi.fn();
let mockSettingsData = {
  pushEnabled: false,
  emailEnabled: true,
  kakaoEnabled: false,
  quietHoursStart: null,
  quietHoursEnd: null,
};

vi.mock('../../../api/useUserQueries', () => ({
  useGetNotificationSettings: () => ({
    data: mockSettingsData,
  }),
  useUpdateNotificationSettings: () => ({
    mutate: mockUpdateSettings,
  }),
}));

describe('NotificationSettingsSection Component', () => {
  const setActiveViewMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSettingsData = {
      pushEnabled: false,
      emailEnabled: true,
      kakaoEnabled: false,
      quietHoursStart: null,
      quietHoursEnd: null,
    };
  });

  it('기본 알림 설정 정보와 토글 스위치들을 올바르게 렌더링해야 한다', () => {
    render(<NotificationSettingsSection setActiveView={setActiveViewMock} />);

    expect(screen.getByText('푸시 알림')).toBeDefined();
    expect(screen.getByText('이메일 알림')).toBeDefined();
    expect(screen.getByText('카카오톡 알림')).toBeDefined();
    expect(screen.getByText('방해 금지 시간 설정')).toBeDefined();
  });

  it('푸시 알림 토글 시 브라우저 권한을 요청하고 granted이면 설정을 갱신해야 한다', async () => {
    vi.spyOn(webNotification, 'isNotificationSupported').mockReturnValue(true);
    vi.spyOn(webNotification, 'requestNotificationPermission').mockResolvedValue('granted');
    const showSpy = vi.spyOn(webNotification, 'showDesktopNotification').mockReturnValue({
      success: true,
      permission: 'granted',
    });

    render(<NotificationSettingsSection setActiveView={setActiveViewMock} />);

    const pushSwitch = screen.getByRole('switch', { name: '푸시 알림 토글' });
    fireEvent.click(pushSwitch);

    await waitFor(() => {
      expect(webNotification.requestNotificationPermission).toHaveBeenCalledTimes(1);
      expect(mockUpdateSettings).toHaveBeenCalledWith({ pushEnabled: true });
      expect(showSpy).toHaveBeenCalledWith('Boim 알림 활성화', expect.any(Object));
    });
  });

  it('푸시 알림 토글 시 권한이 거부(denied)되면 안내 문구를 표시해야 한다', async () => {
    vi.spyOn(webNotification, 'isNotificationSupported').mockReturnValue(true);
    vi.spyOn(webNotification, 'requestNotificationPermission').mockResolvedValue('denied');

    render(<NotificationSettingsSection setActiveView={setActiveViewMock} />);

    const pushSwitch = screen.getByRole('switch', { name: '푸시 알림 토글' });
    fireEvent.click(pushSwitch);

    await waitFor(() => {
      expect(screen.getByText('브라우저 설정에서 알림 권한이 차단되어 있습니다.')).toBeDefined();
      expect(mockUpdateSettings).not.toHaveBeenCalled();
    });
  });

  it('이메일 알림 토글 클릭 시 설정 업데이트를 호출해야 한다', () => {
    render(<NotificationSettingsSection setActiveView={setActiveViewMock} />);

    const emailSwitch = screen.getByRole('switch', { name: '이메일 알림 토글' });
    fireEvent.click(emailSwitch);

    expect(mockUpdateSettings).toHaveBeenCalledWith({ emailEnabled: false });
  });

  it('방해 금지 시간 설정 클릭 시 setActiveView("notificationTime")을 호출해야 한다', () => {
    render(<NotificationSettingsSection setActiveView={setActiveViewMock} />);

    const quietHoursButton = screen.getByText('방해 금지 시간 설정');
    fireEvent.click(quietHoursButton);

    expect(setActiveViewMock).toHaveBeenCalledWith('notificationTime');
  });
});
