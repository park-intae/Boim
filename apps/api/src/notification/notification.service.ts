import { Injectable, NotFoundException } from '@nestjs/common';

export interface NotificationDto {
  id: string;
  type: 'payment' | 'renewal' | 'info';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

@Injectable()
export class NotificationService {
  private notifications: NotificationDto[] = [
    {
      id: '1',
      type: 'payment',
      title: '보험료 납입일 안내',
      message: '내일은 (무)무배당 실손의료보험의 납입일입니다. (예상 금액: 35,000원)',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
    },
    {
      id: '2',
      type: 'renewal',
      title: '자동차 보험 갱신 안내',
      message: '가입하신 다이렉트 자동차보험의 만기가 한 달 남았습니다. 갱신을 준비해주세요.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      isRead: true,
    },
    {
      id: '3',
      type: 'info',
      title: 'Boim 업데이트 안내',
      message: '보험료 분석 기능이 새롭게 추가되었습니다. 지금 바로 확인해보세요!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      isRead: true,
    }
  ];

  findAll(): NotificationDto[] {
    return this.notifications;
  }

  markAsRead(id: string): NotificationDto {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    notification.isRead = true;
    return notification;
  }

  remove(id: string): void {
    const initialLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.id !== id);
    if (this.notifications.length === initialLength) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }
}
