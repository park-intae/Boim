import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import type { NotificationType } from '@boim/shared-types';

export interface BatchNotificationCandidate {
  userId: bigint;
  productId: bigint;
  productName: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: string;
}

export interface BatchExecutionResult {
  success: boolean;
  targetDate: string; // YYYY-MM-DD (KST)
  scannedProducts: number;
  createdNotifications: number;
  skippedCount: number;
  details: {
    productId: string;
    productName: string;
    type: string;
    title: string;
    action: 'created' | 'skipped';
    reason?: string;
  }[];
}

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 매일 자정 (KST 00:00:00) 자동 실행 크론 배치
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'insurance-notification-batch',
    timeZone: 'Asia/Seoul',
  })
  async handleCron(): Promise<void> {
    this.logger.log(
      '매일 자정 보험 납입/만기 알림 배치 스케줄러를 시작합니다.',
    );
    const result = await this.runBatch();
    this.logger.log(
      `배치 완료 [${result.targetDate}]: 검사 상품 ${result.scannedProducts}건, ` +
        `생성 알림 ${result.createdNotifications}건, 스킵 ${result.skippedCount}건`,
    );
  }

  /**
   * 배치 작업 수동 또는 스케줄러 실행
   * @param targetDate 기준 일자 (기본값: 현재 시각 KST)
   */
  async runBatch(targetDate: Date = new Date()): Promise<BatchExecutionResult> {
    const kstFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const [year, month, day] = kstFormatter
      .format(targetDate)
      .split('-')
      .map(Number);
    const targetDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // KST 자정 기준 시각
    const todayKst = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    // 전체 활성 보험 상품 조회
    const products = await this.prisma.insuranceProduct.findMany({
      include: {
        user: {
          include: {
            notificationSettings: true,
          },
        },
      },
    });

    const result: BatchExecutionResult = {
      success: true,
      targetDate: targetDateStr,
      scannedProducts: products.length,
      createdNotifications: 0,
      skippedCount: 0,
      details: [],
    };

    for (const product of products) {
      const candidates: BatchNotificationCandidate[] = [];

      // 1. 월 납입일(D-7, D-1) 탐색
      const paymentCandidate = this.checkPaymentDue(
        product,
        todayKst,
        year,
        month,
      );
      if (paymentCandidate) {
        candidates.push(paymentCandidate);
      }

      // 2. 만기일(D-30, D-7, D-Day) 탐색
      const maturityCandidate = this.checkMaturity(product, todayKst);
      if (maturityCandidate) {
        candidates.push(maturityCandidate);
      }

      // 3. 후보 알림 중복 검증 및 생성
      for (const candidate of candidates) {
        const isDuplicate = await this.prisma.notification.findFirst({
          where: {
            userId: candidate.userId,
            productId: candidate.productId,
            title: candidate.title,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

        if (isDuplicate) {
          result.skippedCount++;
          result.details.push({
            productId: candidate.productId.toString(),
            productName: candidate.productName,
            type: candidate.type,
            title: candidate.title,
            action: 'skipped',
            reason: '이미 당일 동일한 알림이 발송되었습니다.',
          });
          continue;
        }

        // 방해금지 시간 및 채널 필터링
        const userSettings = product.user.notificationSettings;
        const channel = this.determineChannel(userSettings, targetDate);

        await this.prisma.notification.create({
          data: {
            userId: candidate.userId,
            productId: candidate.productId,
            type: candidate.type,
            title: candidate.title,
            message: candidate.message,
            channel,
            isRead: false,
            status: 'sent',
          },
        });

        result.createdNotifications++;
        result.details.push({
          productId: candidate.productId.toString(),
          productName: candidate.productName,
          type: candidate.type,
          title: candidate.title,
          action: 'created',
        });
      }
    }

    return result;
  }

  /**
   * 월 보험료 납입일 체크 (D-7, D-1)
   */
  checkPaymentDue(
    product: {
      id: bigint;
      userId: bigint;
      name: string;
      institution: string;
      startDate: Date;
      maturityDate: Date;
      monthlyPayment: number;
    },
    todayKst: Date,
    currentYear: number,
    currentMonth: number,
  ): BatchNotificationCandidate | null {
    const kstFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const [sY, sM, sD] = kstFormatter
      .format(product.startDate)
      .split('-')
      .map(Number);
    const [mY, mM, mD] = kstFormatter
      .format(product.maturityDate)
      .split('-')
      .map(Number);

    const startKst = new Date(Date.UTC(sY, sM - 1, sD, 0, 0, 0, 0));
    const maturityKst = new Date(Date.UTC(mY, mM - 1, mD, 0, 0, 0, 0));

    // 유효 기간 체크
    if (todayKst < startKst || todayKst > maturityKst) {
      return null;
    }

    const originalDueDay = sD;

    // 당월 납입일 계산 (월말 일수 보정)
    const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
    const effectiveCurrentDueDay = Math.min(originalDueDay, daysInCurrentMonth);
    const currentMonthDueDate = new Date(
      Date.UTC(
        currentYear,
        currentMonth - 1,
        effectiveCurrentDueDay,
        0,
        0,
        0,
        0,
      ),
    );

    // 익월 납입일 계산 (당월 납입일이 이미 지났을 때)
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const daysInNextMonth = new Date(nextYear, nextMonth, 0).getDate();
    const effectiveNextDueDay = Math.min(originalDueDay, daysInNextMonth);
    const nextMonthDueDate = new Date(
      Date.UTC(nextYear, nextMonth - 1, effectiveNextDueDay, 0, 0, 0, 0),
    );

    // 가장 가까운 미래의 납입일 선정
    const targetDueDate =
      currentMonthDueDate >= todayKst ? currentMonthDueDate : nextMonthDueDate;

    const diffDays = Math.round(
      (targetDueDate.getTime() - todayKst.getTime()) / (1000 * 60 * 60 * 24),
    );

    const formattedPayment = Number(product.monthlyPayment).toLocaleString(
      'ko-KR',
    );
    const dueDateStr = `${targetDueDate.getUTCMonth() + 1}월 ${targetDueDate.getUTCDate()}일`;

    if (diffDays === 7) {
      return {
        userId: product.userId,
        productId: product.id,
        productName: product.name,
        type: 'payment',
        title: `[납입 안내] ${product.name} 보험료 납입 7일 전입니다.`,
        message: `7일 후(${dueDateStr})에 ${product.institution} ${product.name}의 월 보험료 ${formattedPayment}원이 납부될 예정입니다.`,
        channel: 'in_app',
      };
    }

    if (diffDays === 1) {
      return {
        userId: product.userId,
        productId: product.id,
        productName: product.name,
        type: 'payment',
        title: `[납입 안내] ${product.name} 보험료 납입 1일 전입니다.`,
        message: `내일(${dueDateStr}) ${product.institution} ${product.name}의 월 보험료 ${formattedPayment}원이 출금될 예정입니다. 계좌 잔액을 확인해주세요.`,
        channel: 'in_app',
      };
    }

    return null;
  }

  /**
   * 보험 만기일 체크 (D-30, D-7, D-Day)
   */
  checkMaturity(
    product: {
      id: bigint;
      userId: bigint;
      name: string;
      institution: string;
      maturityDate: Date;
    },
    todayKst: Date,
  ): BatchNotificationCandidate | null {
    const kstFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const [mY, mM, mD] = kstFormatter
      .format(product.maturityDate)
      .split('-')
      .map(Number);
    const maturityKst = new Date(Date.UTC(mY, mM - 1, mD, 0, 0, 0, 0));

    const diffDays = Math.round(
      (maturityKst.getTime() - todayKst.getTime()) / (1000 * 60 * 60 * 24),
    );

    const maturityDateStr = `${mY}년 ${mM}월 ${mD}일`;

    if (diffDays === 30) {
      return {
        userId: product.userId,
        productId: product.id,
        productName: product.name,
        type: 'maturity',
        title: `[만기 안내] ${product.name} 만기 30일 전입니다.`,
        message: `가입하신 ${product.institution} ${product.name} 상품이 30일 후(${maturityDateStr}) 만기 도래 예정입니다. 만기 후 보장 공백을 방지하기 위해 리모델링 또는 연장을 검토해보세요.`,
        channel: 'in_app',
      };
    }

    if (diffDays === 7) {
      return {
        userId: product.userId,
        productId: product.id,
        productName: product.name,
        type: 'maturity',
        title: `[만기 안내] ${product.name} 만기 7일 전입니다.`,
        message: `가입하신 ${product.institution} ${product.name} 상품이 7일 후(${maturityDateStr}) 만기됩니다. 만기 환급금 수령 및 재가입 여부를 확인해주세요.`,
        channel: 'in_app',
      };
    }

    if (diffDays === 0) {
      return {
        userId: product.userId,
        productId: product.id,
        productName: product.name,
        type: 'maturity',
        title: `[만기 도래] ${product.name} 오늘 만기일입니다.`,
        message: `가입하신 ${product.institution} ${product.name} 상품이 오늘(${maturityDateStr}) 만기되었습니다. 환급금 수령 절차를 진행해주시기 바랍니다.`,
        channel: 'in_app',
      };
    }

    return null;
  }

  /**
   * 사용자 알림 설정 및 방해 금지 시간에 따른 채널 결정
   */
  determineChannel(
    settings: {
      pushEnabled: boolean;
      emailEnabled: boolean;
      kakaoEnabled: boolean;
      quietHoursStart: string | null;
      quietHoursEnd: string | null;
    } | null,
    nowDate: Date,
  ): string {
    if (!settings) {
      return 'in_app';
    }

    // 방해 금지 시간 체크
    if (settings.quietHoursStart && settings.quietHoursEnd) {
      const isQuiet = this.isQuietTime(
        settings.quietHoursStart,
        settings.quietHoursEnd,
        nowDate,
      );
      if (isQuiet) {
        // 방해 금지 시간일 때는 외부 푸시/알림 없이 조용히 인앱에만 저장
        return 'in_app';
      }
    }

    if (settings.kakaoEnabled) return 'kakao';
    if (settings.pushEnabled) return 'push';
    if (settings.emailEnabled) return 'email';

    return 'in_app';
  }

  /**
   * 현재 시각이 방해 금지 시간 범위에 속하는지 판별
   * @param start HH:mm (예: "22:00")
   * @param end HH:mm (예: "08:00")
   */
  isQuietTime(start: string, end: string, nowDate: Date): boolean {
    const kstTimeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const [hourStr, minuteStr] = kstTimeFormatter.format(nowDate).split(':');
    const currentMinutes = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);

    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      // 주간 방해 금지 (예: 13:00 ~ 15:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // 야간 방해 금지 (예: 22:00 ~ 08:00 자정을 걸치는 경우)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }
}
