import type { UserDto, NotificationSettingsDto, LoginHistoryDto } from '@boim/shared-types';

export const mockUser: UserDto = {
  id: 1,
  email: 'hong@example.com',
  name: '홍길동',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockNotificationSettings: NotificationSettingsDto = {
  pushEnabled: true,
  emailEnabled: true,
  kakaoEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

export const mockLoginHistories: LoginHistoryDto[] = [
  {
    id: 1,
    userId: 1,
    device: 'Chrome / Windows',
    ipAddress: '127.0.0.1',
    location: '서울, 대한민국',
    loginAt: '2026-11-11T10:00:00.000Z',
  },
  {
    id: 2,
    userId: 1,
    device: 'Safari / iPhone',
    ipAddress: '211.234.12.34',
    location: '경기 성남시, 대한민국',
    loginAt: '2026-11-10T18:30:00.000Z',
  },
];
