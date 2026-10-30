import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import type { RequestWithJwtUser } from '../auth/auth.controller';

describe('NotificationController', () => {
  let controller: NotificationController;

  const mockNotification = {
    id: '1',
    userId: '1',
    productId: '10',
    type: 'payment',
    title: '보험료 납입일 안내',
    message: '내일은 납입일입니다.',
    channel: 'in_app',
    isRead: false,
    sentAt: new Date().toISOString(),
    status: 'sent',
    createdAt: new Date().toISOString(),
  };

  const mockNotificationService = {
    findAll: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    remove: jest.fn(),
    createNotification: jest.fn(),
  };

  const mockReq = {
    user: { userId: '1', email: 'test@example.com' },
  } as unknown as RequestWithJwtUser;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('요청 사용자의 알림 목록을 반환한다', async () => {
      mockNotificationService.findAll.mockResolvedValue([mockNotification]);

      const result = await controller.findAll(mockReq);

      expect(mockNotificationService.findAll).toHaveBeenCalledWith(1n);
      expect(result).toEqual([mockNotification]);
    });
  });

  describe('markAsRead', () => {
    it('지정한 ID의 알림을 읽음 처리한다', async () => {
      mockNotificationService.markAsRead.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await controller.markAsRead(mockReq, '1');

      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(1n, 1n);
      expect(result.isRead).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('전체 알림을 읽음 처리한다', async () => {
      mockNotificationService.markAllAsRead.mockResolvedValue({ count: 5 });

      const result = await controller.markAllAsRead(mockReq);

      expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith(1n);
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('remove', () => {
    it('지정한 ID의 알림을 삭제하고 true를 반환한다', async () => {
      mockNotificationService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockReq, '1');

      expect(mockNotificationService.remove).toHaveBeenCalledWith(1n, 1n);
      expect(result).toBe(true);
    });
  });
});
