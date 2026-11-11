/**
 * HTML5 Web Notification API 헬퍼 유틸리티
 */

export interface DesktopNotificationResult {
  success: boolean;
  permission: NotificationPermission;
  notification?: Notification;
  reason?: string;
}

/**
 * 브라우저 환경에서 Notification API 지원 여부 확인
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * 현재 브라우저의 알림 권한 상태 반환
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * 브라우저 알림 권한 요청
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return Notification.permission;
  }
};

/**
 * 실제 OS 데스크톱 알림 토스트 팝업 발송
 */
export const showDesktopNotification = (
  title: string,
  options?: NotificationOptions,
): DesktopNotificationResult => {
  if (!isNotificationSupported()) {
    return {
      success: false,
      permission: 'denied',
      reason: 'Browser does not support Notification API',
    };
  }

  const permission = Notification.permission;

  if (permission !== 'granted') {
    return {
      success: false,
      permission,
      reason: `Notification permission is not granted (current: ${permission})`,
    };
  }

  try {
    const defaultOptions: NotificationOptions = {
      badge: '/favicon.ico',
      icon: '/favicon.ico',
      ...options,
    };

    const notification = new Notification(title, defaultOptions);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return {
      success: true,
      permission: 'granted',
      notification,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      permission: 'granted',
      reason: err.message,
    };
  }
};
