import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationSchedulerService', () => {
  let service: NotificationSchedulerService;

  const mockPrisma = {
    insuranceProduct: {
      findMany: jest.fn(),
    },
    notification: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSchedulerService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<NotificationSchedulerService>(
      NotificationSchedulerService,
    );
    jest.clearAllMocks();
  });

  describe('checkPaymentDue', () => {
    const baseProduct = {
      id: BigInt(1),
      userId: BigInt(10),
      name: '현대해상 실손보험',
      institution: '현대해상',
      startDate: new Date('2025-01-15T00:00:00Z'), // 납입일: 매월 15일
      maturityDate: new Date('2035-01-15T00:00:00Z'),
      monthlyPayment: 50000,
    };

    it('납입일 7일 전(D-7)일 경우 payment 알림 후보를 반환해야 한다', () => {
      // 2026-11-08 -> 11월 15일까지 7일 남음
      const todayKst = new Date(Date.UTC(2026, 10, 8, 0, 0, 0, 0));
      const candidate = service.checkPaymentDue(
        baseProduct,
        todayKst,
        2026,
        11,
      );

      expect(candidate).not.toBeNull();
      expect(candidate?.type).toBe('payment');
      expect(candidate?.title).toContain('보험료 납입 7일 전');
      expect(candidate?.message).toContain('50,000원');
      expect(candidate?.message).toContain('11월 15일');
    });

    it('납입일 1일 전(D-1)일 경우 payment 알림 후보를 반환해야 한다', () => {
      // 2026-11-14 -> 11월 15일까지 1일 남음
      const todayKst = new Date(Date.UTC(2026, 10, 14, 0, 0, 0, 0));
      const candidate = service.checkPaymentDue(
        baseProduct,
        todayKst,
        2026,
        11,
      );

      expect(candidate).not.toBeNull();
      expect(candidate?.type).toBe('payment');
      expect(candidate?.title).toContain('보험료 납입 1일 전');
      expect(candidate?.message).toContain('계좌 잔액을 확인해주세요');
    });

    it('납입일 D-7, D-1이 아닌 경우 null을 반환해야 한다', () => {
      // 2026-11-10 -> 5일 전이므로 null
      const todayKst = new Date(Date.UTC(2026, 10, 10, 0, 0, 0, 0));
      const candidate = service.checkPaymentDue(
        baseProduct,
        todayKst,
        2026,
        11,
      );

      expect(candidate).toBeNull();
    });

    it('만기일 이후의 날짜인 경우 null을 반환해야 한다', () => {
      const todayKst = new Date(Date.UTC(2036, 10, 8, 0, 0, 0, 0));
      const candidate = service.checkPaymentDue(
        baseProduct,
        todayKst,
        2036,
        11,
      );

      expect(candidate).toBeNull();
    });
  });

  describe('checkMaturity', () => {
    const baseProduct = {
      id: BigInt(2),
      userId: BigInt(10),
      name: '삼성생명 정기보험',
      institution: '삼성생명',
      maturityDate: new Date('2026-12-04T00:00:00Z'),
    };

    it('만기 30일 전(D-30)일 경우 maturity 알림 후보를 반환해야 한다', () => {
      // 2026-11-04 -> 2026-12-04는 30일 차이
      const todayKst = new Date(Date.UTC(2026, 10, 4, 0, 0, 0, 0));
      const candidate = service.checkMaturity(baseProduct, todayKst);

      expect(candidate).not.toBeNull();
      expect(candidate?.type).toBe('maturity');
      expect(candidate?.title).toContain('만기 30일 전');
    });

    it('만기 7일 전(D-7)일 경우 maturity 알림 후보를 반환해야 한다', () => {
      // 2026-11-27 -> 2026-12-04는 7일 차이
      const todayKst = new Date(Date.UTC(2026, 10, 27, 0, 0, 0, 0));
      const candidate = service.checkMaturity(baseProduct, todayKst);

      expect(candidate).not.toBeNull();
      expect(candidate?.type).toBe('maturity');
      expect(candidate?.title).toContain('만기 7일 전');
    });

    it('만기 당일(D-Day)일 경우 maturity 알림 후보를 반환해야 한다', () => {
      const todayKst = new Date(Date.UTC(2026, 11, 4, 0, 0, 0, 0));
      const candidate = service.checkMaturity(baseProduct, todayKst);

      expect(candidate).not.toBeNull();
      expect(candidate?.type).toBe('maturity');
      expect(candidate?.title).toContain('오늘 만기일입니다');
    });

    it('만기 조건에 해당하지 않는 날짜는 null을 반환해야 한다', () => {
      const todayKst = new Date(Date.UTC(2026, 10, 15, 0, 0, 0, 0));
      const candidate = service.checkMaturity(baseProduct, todayKst);

      expect(candidate).toBeNull();
    });
  });

  describe('isQuietTime 및 determineChannel', () => {
    it('야간 방해 금지 시간(22:00 ~ 08:00) 내 시각인 경우 true를 반환해야 한다', () => {
      // 새벽 03:00 KST
      const nightDate = new Date('2026-11-04T03:00:00+09:00');
      const isQuiet = service.isQuietTime('22:00', '08:00', nightDate);
      expect(isQuiet).toBe(true);
    });

    it('야간 방해 금지 시간(22:00 ~ 08:00) 밖인 경우 false를 반환해야 한다', () => {
      // 낮 14:00 KST
      const dayDate = new Date('2026-11-04T14:00:00+09:00');
      const isQuiet = service.isQuietTime('22:00', '08:00', dayDate);
      expect(isQuiet).toBe(false);
    });

    it('방해 금지 시간대에는 알림 채널을 항상 in_app으로 격리해야 한다', () => {
      const nightDate = new Date('2026-11-04T01:00:00+09:00');
      const channel = service.determineChannel(
        {
          pushEnabled: true,
          emailEnabled: true,
          kakaoEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        },
        nightDate,
      );
      expect(channel).toBe('in_app');
    });

    it('방해 금지 시간대가 아닐 때는 사용자가 활성화한 채널을 반환해야 한다', () => {
      const dayDate = new Date('2026-11-04T15:00:00+09:00');
      const channel = service.determineChannel(
        {
          pushEnabled: true,
          emailEnabled: false,
          kakaoEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        },
        dayDate,
      );
      expect(channel).toBe('kakao');
    });
  });

  describe('dispatchExternalChannel', () => {
    const candidate = {
      userId: BigInt(1),
      productId: BigInt(10),
      productName: '실손보험',
      type: 'payment' as const,
      title: '납입 안내',
      message: '납입일입니다',
      channel: 'email',
    };

    it('email 채널일 때 sendEmail을 호출해야 한다', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');
      await service.dispatchExternalChannel(
        'email',
        candidate,
        'user@test.com',
      );
      expect(sendEmailSpy).toHaveBeenCalledWith(
        'user@test.com',
        '납입 안내',
        '납입일입니다',
      );
    });

    it('push 채널일 때 sendPush를 호출해야 한다', async () => {
      const sendPushSpy = jest.spyOn(service, 'sendPush');
      await service.dispatchExternalChannel('push', candidate);
      expect(sendPushSpy).toHaveBeenCalledWith(
        '1',
        '납입 안내',
        '납입일입니다',
      );
    });

    it('kakao 채널일 때 sendKakao를 호출해야 한다', async () => {
      const sendKakaoSpy = jest.spyOn(service, 'sendKakao');
      await service.dispatchExternalChannel('kakao', candidate);
      expect(sendKakaoSpy).toHaveBeenCalledWith(
        '1',
        '납입 안내',
        '납입일입니다',
      );
    });

    it('외부 채널 발송 중 오류가 발생해도 예외를 전파하지 않고 흡수해야 한다', async () => {
      jest
        .spyOn(service, 'sendEmail')
        .mockRejectedValueOnce(new Error('SMTP connection error'));
      await expect(
        service.dispatchExternalChannel('email', candidate, 'user@test.com'),
      ).resolves.not.toThrow();
    });
  });

  describe('runBatch', () => {
    it('도래한 알림을 생성하고 외부 채널 분기 발송을 수행해야 한다', async () => {
      mockPrisma.insuranceProduct.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          userId: BigInt(10),
          name: '현대해상 실손보험',
          institution: '현대해상',
          startDate: new Date('2024-01-11T00:00:00Z'),
          maturityDate: new Date('2030-01-11T00:00:00Z'),
          monthlyPayment: 30000,
          coverageAmount: BigInt(50000000),
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            email: 'user@test.com',
            name: '홍길동',
            notificationSettings: {
              pushEnabled: true,
              emailEnabled: false,
              kakaoEnabled: false,
              quietHoursStart: null,
              quietHoursEnd: null,
            },
          },
        },
      ]);

      mockPrisma.notification.findFirst.mockResolvedValueOnce(null);
      mockPrisma.notification.create.mockResolvedValue({
        id: BigInt(100),
      } as any);

      const dispatchSpy = jest.spyOn(service, 'dispatchExternalChannel');

      const result = await service.runBatch(
        new Date('2026-11-04T12:00:00+09:00'),
      );

      expect(result.success).toBe(true);
      expect(result.scannedProducts).toBe(1);
      expect(result.createdNotifications).toBe(1);
      expect(result.skippedCount).toBe(0);
      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('동일한 알림이 이미 오늘 생성되어 있으면 스킵해야 한다', async () => {
      mockPrisma.insuranceProduct.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          userId: BigInt(10),
          name: '현대해상 실손보험',
          institution: '현대해상',
          startDate: new Date('2024-01-11T00:00:00Z'),
          maturityDate: new Date('2030-01-11T00:00:00Z'),
          monthlyPayment: 30000,
          coverageAmount: BigInt(50000000),
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            email: 'user@test.com',
            name: '홍길동',
            notificationSettings: null,
          },
        },
      ]);

      // 이미 생성된 알림이 존재
      mockPrisma.notification.findFirst.mockResolvedValue({
        id: BigInt(99),
        title: '[납입 안내] 현대해상 실손보험 보험료 납입 7일 전입니다.',
      } as any);

      const result = await service.runBatch(
        new Date('2026-11-04T12:00:00+09:00'),
      );

      expect(result.scannedProducts).toBe(1);
      expect(result.createdNotifications).toBe(0);
      expect(result.skippedCount).toBe(1);
      expect(result.details[0].action).toBe('skipped');
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });
  });
});
