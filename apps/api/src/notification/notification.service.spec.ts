import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationService', () => {
  let service: NotificationService;

  const mockDate = new Date('2026-10-30T00:00:00.000Z');
  const mockNotification = {
    id: 101n,
    userId: 1n,
    productId: 5n,
    type: 'payment',
    title: '보험료 납입일 안내',
    message: '내일은 보험료 납입일입니다.',
    channel: 'in_app',
    isRead: false,
    sentAt: mockDate,
    status: 'sent',
    createdAt: mockDate,
  };

  const mockPrismaService = {
    notification: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('특정 사용자의 알림 목록을 최신순으로 조회하여 NotificationDto 배열로 반환한다', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([mockNotification]);

      const result = await service.findAll(1n);

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 1n },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '101',
        userId: '1',
        productId: '5',
        type: 'payment',
        title: '보험료 납입일 안내',
        message: '내일은 보험료 납입일입니다.',
        channel: 'in_app',
        isRead: false,
        sentAt: mockDate.toISOString(),
        status: 'sent',
        createdAt: mockDate.toISOString(),
      });
    });
  });

  describe('markAsRead', () => {
    it('존재하는 알림을 읽음 처리하고 갱신된 DTO를 반환한다', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(mockNotification);
      mockPrismaService.notification.update.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await service.markAsRead(1n, 101n);

      expect(mockPrismaService.notification.findFirst).toHaveBeenCalledWith({
        where: { id: 101n, userId: 1n },
      });
      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: 101n },
        data: { isRead: true },
      });
      expect(result.isRead).toBe(true);
    });

    it('본인 소유가 아니거나 존재하지 않는 알림이면 NotFoundException을 던진다', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      await expect(service.markAsRead(1n, 999n)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('사용자의 모든 미읽음 알림을 읽음 처리하고 업데이트된 개수를 반환한다', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead(1n);

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 1n, isRead: false },
        data: { isRead: true },
      });
      expect(result).toEqual({ count: 3 });
    });
  });

  describe('remove', () => {
    it('존재하는 알림을 삭제한다', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(mockNotification);
      mockPrismaService.notification.delete.mockResolvedValue(mockNotification);

      await service.remove(1n, 101n);

      expect(mockPrismaService.notification.findFirst).toHaveBeenCalledWith({
        where: { id: 101n, userId: 1n },
      });
      expect(mockPrismaService.notification.delete).toHaveBeenCalledWith({
        where: { id: 101n },
      });
    });

    it('존재하지 않는 알림이면 NotFoundException을 던진다', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      await expect(service.remove(1n, 999n)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createNotification', () => {
    it('새 알림을 DB에 생성하고 DTO로 반환한다', async () => {
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);

      const result = await service.createNotification({
        userId: 1n,
        productId: 5n,
        type: 'payment',
        title: '보험료 납입일 안내',
        message: '내일은 보험료 납입일입니다.',
        channel: 'in_app',
      });

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 1n,
          productId: 5n,
          type: 'payment',
          title: '보험료 납입일 안내',
          message: '내일은 보험료 납입일입니다.',
          channel: 'in_app',
          isRead: false,
        },
      });
      expect(result.id).toBe('101');
    });
  });
});
