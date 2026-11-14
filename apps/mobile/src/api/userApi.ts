import { API_BASE_URL } from './authApi';
import type {
  ApiResponse,
  NotificationSettingsDto,
  UpdateNotificationSettingsDto,
} from '@boim/shared-types';

export const fetchNotificationSettings = async (
  token?: string | null,
): Promise<NotificationSettingsDto> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/users/me/notifications/settings`, {
    method: 'GET',
    headers,
  });

  const result: ApiResponse<NotificationSettingsDto> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error?.message || '알림 설정을 불러오지 못했습니다.');
  }

  return result.data;
};

export const updateNotificationSettings = async (
  dto: UpdateNotificationSettingsDto,
  token?: string | null,
): Promise<NotificationSettingsDto> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/users/me/notifications/settings`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(dto),
  });

  const result: ApiResponse<NotificationSettingsDto> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error?.message || '알림 설정 업데이트에 실패했습니다.');
  }

  return result.data;
};
