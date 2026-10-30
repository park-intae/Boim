import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  NotificationDto,
  CreateNotificationDto,
} from '@boim/shared-types';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 사용자 알림 목록 조회 (최신순)
   */
  async findAll(userId: bigint): Promise<NotificationDto[]> {
    const list = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((item) => ({
      id: item.id.toString(),
      userId: item.userId.toString(),
      productId: item.productId ? item.productId.toString() : null,
      type: item.type,
      title: item.title,
      message: item.message,
      channel: item.channel,
      isRead: item.isRead,
      sentAt: item.sentAt.toISOString(),
      status: item.status,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  /**
   * 특정 알림 읽음 처리
   */
  async markAsRead(userId: bigint, id: bigint): Promise<NotificationDto> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`해당 알림(ID: ${id})을 찾을 수 없습니다.`);
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return {
      id: updated.id.toString(),
      userId: updated.userId.toString(),
      productId: updated.productId ? updated.productId.toString() : null,
      type: updated.type,
      title: updated.title,
      message: updated.message,
      channel: updated.channel,
      isRead: updated.isRead,
      sentAt: updated.sentAt.toISOString(),
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(userId: bigint): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { count: result.count };
  }

  /**
   * 특정 알림 삭제
   */
  async remove(userId: bigint, id: bigint): Promise<void> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`해당 알림(ID: ${id})을 찾을 수 없습니다.`);
    }

    await this.prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * 알림 생성 (스케줄러 또는 서비스 내부용)
   */
  async createNotification(
    data: CreateNotificationDto,
  ): Promise<NotificationDto> {
    const created = await this.prisma.notification.create({
      data: {
        userId: BigInt(data.userId),
        productId: data.productId ? BigInt(data.productId) : null,
        type: data.type,
        title: data.title,
        message: data.message,
        channel: data.channel ?? 'in_app',
        isRead: data.isRead ?? false,
      },
    });

    return {
      id: created.id.toString(),
      userId: created.userId.toString(),
      productId: created.productId ? created.productId.toString() : null,
      type: created.type,
      title: created.title,
      message: created.message,
      channel: created.channel,
      isRead: created.isRead,
      sentAt: created.sentAt.toISOString(),
      status: created.status,
      createdAt: created.createdAt.toISOString(),
    };
  }
}
