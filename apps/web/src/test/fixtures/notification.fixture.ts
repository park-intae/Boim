import type { NotificationDto } from '@boim/shared-types';

export const mockNotifications: NotificationDto[] = [
  {
    id: 'notif-1',
    userId: 1,
    productId: 1,
    type: 'payment',
    title: '보험료 납입 예정 안내',
    message: '현대해상 굿앤굿어린이종합보험 납입일(15일)이 3일 남았습니다.',
    isRead: false,
    channel: 'in_app',
    createdAt: '2026-11-12T09:00:00.000Z',
  },
  {
    id: 'notif-2',
    userId: 1,
    productId: 2,
    type: 'renewal',
    title: '실손의료비 갱신 안내',
    message: '삼성화재 실손의료비보장보험 갱신 안내문이 발송되었습니다.',
    isRead: true,
    channel: 'email',
    createdAt: '2026-11-05T14:20:00.000Z',
  },
  {
    id: 'notif-3',
    userId: 1,
    productId: 3,
    type: 'maturity',
    title: '만기 예정 알림',
    message: 'KB 암케어종합치료보험 만기가 도래했습니다.',
    isRead: false,
    channel: 'push',
    createdAt: '2026-11-01T10:00:00.000Z',
  },
];
