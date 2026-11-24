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

  it('Notification API가 지원되지 않는 환경에서는 false/denied를 안전하게 반환해야 한다', async () => {
    delete (window as { Notification?: unknown }).Notification;

    expect(isNotificationSupported()).toBe(false);
    expect(getNotificationPermission()).toBe('denied');
    expect(await requestNotificationPermission()).toBe('denied');

    const result = showDesktopNotification('미지원 알림');
    expect(result.success).toBe(false);
    expect(result.permission).toBe('denied');
    expect(result.reason).toContain('does not support');
  });

  it('requestPermission이 reject되면 기존 Notification.permission을 반환해야 한다', async () => {
    class MockNotification {
      static permission: NotificationPermission = 'default';
      static requestPermission = vi.fn().mockRejectedValue(new Error('Permission blocked'));
    }
    window.Notification = MockNotification as unknown as typeof Notification;

    const result = await requestNotificationPermission();
    expect(result).toBe('default');
  });

  it('Notification 생성자가 예외를 던지면 success: false와 에러 사유를 반환해야 한다', () => {
    class ThrowingNotification {
      static permission: NotificationPermission = 'granted';
      constructor() {
        throw new Error('Notification constructor failed');
      }
    }
    window.Notification = ThrowingNotification as unknown as typeof Notification;

    const result = showDesktopNotification('예외 알림');
    expect(result.success).toBe(false);
    expect(result.permission).toBe('granted');
    expect(result.reason).toBe('Notification constructor failed');
  });
});
