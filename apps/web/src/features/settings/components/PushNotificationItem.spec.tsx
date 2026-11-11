import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PushNotificationItem } from './PushNotificationItem';
import * as webNotification from '../../../shared/utils/webNotification';

vi.mock('../../../shared/utils/webNotification', () => ({
  isNotificationSupported: vi.fn(),
  requestNotificationPermission: vi.fn(),
  showDesktopNotification: vi.fn(),
  getNotificationPermission: vi.fn(),
}));

describe('PushNotificationItem Component', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(webNotification.isNotificationSupported).mockReturnValue(true);
    vi.mocked(webNotification.getNotificationPermission).mockReturnValue('default');
  });

  it('renders correctly with switch state', () => {
    render(<PushNotificationItem enabled={false} onToggle={mockOnToggle} />);
    const toggleBtn = screen.getByRole('switch', { name: '푸시 알림 토글' });
    expect(toggleBtn).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('웹 브라우저 데스크톱 알림')).toBeInTheDocument();
  });

  it('shows unsupported notice when notification is not supported', async () => {
    vi.mocked(webNotification.isNotificationSupported).mockReturnValue(false);

    render(<PushNotificationItem enabled={false} onToggle={mockOnToggle} />);
    const toggleBtn = screen.getByRole('switch', { name: '푸시 알림 토글' });
    fireEvent.click(toggleBtn);

    expect(await screen.findByText('현재 브라우저는 데스크톱 알림을 지원하지 않습니다.')).toBeInTheDocument();
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('calls onToggle(true) and sends desktop notification when permission is granted', async () => {
    vi.mocked(webNotification.requestNotificationPermission).mockResolvedValue('granted');

    render(<PushNotificationItem enabled={false} onToggle={mockOnToggle} />);
    const toggleBtn = screen.getByRole('switch', { name: '푸시 알림 토글' });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(mockOnToggle).toHaveBeenCalledWith(true);
      expect(webNotification.showDesktopNotification).toHaveBeenCalledWith('Boim 알림 활성화', expect.any(Object));
    });
  });

  it('shows denied notice when permission is denied', async () => {
    vi.mocked(webNotification.requestNotificationPermission).mockResolvedValue('denied');

    render(<PushNotificationItem enabled={false} onToggle={mockOnToggle} />);
    const toggleBtn = screen.getByRole('switch', { name: '푸시 알림 토글' });
    fireEvent.click(toggleBtn);

    expect(await screen.findByText('브라우저 설정에서 알림 권한이 차단되어 있습니다.')).toBeInTheDocument();
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('shows dismissed notice when permission is dismissed/default', async () => {
    vi.mocked(webNotification.requestNotificationPermission).mockResolvedValue('default');

    render(<PushNotificationItem enabled={false} onToggle={mockOnToggle} />);
    const toggleBtn = screen.getByRole('switch', { name: '푸시 알림 토글' });
    fireEvent.click(toggleBtn);

    expect(await screen.findByText('알림 권한 요청이 취소되었습니다.')).toBeInTheDocument();
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('calls onToggle(false) when toggled off', () => {
    render(<PushNotificationItem enabled={true} onToggle={mockOnToggle} />);
    const toggleBtn = screen.getByRole('switch', { name: '푸시 알림 토글' });
    fireEvent.click(toggleBtn);

    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });
});
