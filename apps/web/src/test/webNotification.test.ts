import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showDesktopNotification,
} from '../shared/utils/webNotification';

describe('webNotification utility', () => {
  const originalNotification = window.Notification;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.Notification = originalNotification;
  });

  it('Notification API가 window에 존재하면 isNotificationSupported는 true를 반환해야 한다', () => {
    // Vitest jsdom 환경 기본 또는 모킹
    window.Notification = class {} as unknown as typeof Notification;
    expect(isNotificationSupported()).toBe(true);
  });

  it('getNotificationPermission은 현재 권한 상태를 반환해야 한다', () => {
    class MockNotification {
      static permission: NotificationPermission = 'granted';
    }
    window.Notification = MockNotification as unknown as typeof Notification;

    expect(getNotificationPermission()).toBe('granted');
  });

  it('requestNotificationPermission은 Notification.requestPermission 결과를 반환해야 한다', async () => {
    class MockNotification {
      static permission: NotificationPermission = 'default';
      static requestPermission = vi.fn().mockResolvedValue('granted');
    }
    window.Notification = MockNotification as unknown as typeof Notification;

    const result = await requestNotificationPermission();
    expect(result).toBe('granted');
    expect(MockNotification.requestPermission).toHaveBeenCalledTimes(1);
  });

  it('권한이 granted일 때 showDesktopNotification은 새 Notification 인스턴스를 생성하고 success: true를 반환해야 한다', () => {
    const mockConstructor = vi.fn();
    class MockNotification {
      static permission: NotificationPermission = 'granted';
      onclick: (() => void) | null = null;
      close = vi.fn();
      constructor(title: string, options?: NotificationOptions) {
        mockConstructor(title, options);
      }
    }
    window.Notification = MockNotification as unknown as typeof Notification;

    const result = showDesktopNotification('테스트 알림', { body: '내용입니다' });

    expect(result.success).toBe(true);
    expect(result.permission).toBe('granted');
    expect(mockConstructor).toHaveBeenCalledWith('테스트 알림', expect.objectContaining({
      body: '내용입니다',
      icon: '/favicon.ico',
    }));
  });

  it('권한이 denied일 때 showDesktopNotification은 알림을 생성하지 않고 success: false를 반환해야 한다', () => {
    const mockConstructor = vi.fn();
    class MockNotification {
      static permission: NotificationPermission = 'denied';
      constructor(title: string, options?: NotificationOptions) {
        mockConstructor(title, options);
      }
    }
    window.Notification = MockNotification as unknown as typeof Notification;

    const result = showDesktopNotification('차단된 알림');

    expect(result.success).toBe(false);
    expect(result.permission).toBe('denied');
    expect(mockConstructor).not.toHaveBeenCalled();
  });
});
