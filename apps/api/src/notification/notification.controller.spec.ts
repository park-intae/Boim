import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
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

  const mockSchedulerService = {
    runBatch: jest.fn(),
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
        {
          provide: NotificationSchedulerService,
          useValue: mockSchedulerService,
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

  describe('createNotification', () => {
    it('새 알림을 생성한다', async () => {
      mockNotificationService.createNotification.mockResolvedValue(
        mockNotification,
      );

      const result = await controller.createNotification(mockReq, {
        title: '새 알림',
        message: '내용',
      });

      expect(mockNotificationService.createNotification).toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });
  });

  describe('triggerBatch', () => {
    it('지정한 기준 일자로 스케줄러 배치를 수동 구동한다', async () => {
      const mockBatchResult = {
        success: true,
        targetDate: '2026-11-04',
        scannedProducts: 1,
        createdNotifications: 1,
        skippedCount: 0,
        details: [],
      };
      mockSchedulerService.runBatch.mockResolvedValue(mockBatchResult);

      const result = await controller.triggerBatch({
        targetDate: '2026-11-04',
      });

      expect(mockSchedulerService.runBatch).toHaveBeenCalledWith(
        new Date('2026-11-04'),
      );
      expect(result).toEqual(mockBatchResult);
    });

    it('날짜 미입력 시 현재 시각 기준으로 배치를 수동 구동한다', async () => {
      const mockBatchResult = {
        success: true,
        targetDate: '2026-11-04',
        scannedProducts: 0,
        createdNotifications: 0,
        skippedCount: 0,
        details: [],
      };
      mockSchedulerService.runBatch.mockResolvedValue(mockBatchResult);

      const result = await controller.triggerBatch();

      expect(mockSchedulerService.runBatch).toHaveBeenCalled();
      expect(result).toEqual(mockBatchResult);
    });
  });
});
