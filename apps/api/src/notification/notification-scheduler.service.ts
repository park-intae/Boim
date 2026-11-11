import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import {
  NotificationRuleEvaluator,
  type BatchNotificationCandidate,
  type EvaluatorProduct,
  type EvaluatorNotificationSettings,
} from './notification-rule.evaluator';

export type { BatchNotificationCandidate } from './notification-rule.evaluator';

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
  private readonly evaluator: NotificationRuleEvaluator;

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly emailService?: EmailService,
    @Optional() evaluator?: NotificationRuleEvaluator,
  ) {
    this.evaluator = evaluator ?? new NotificationRuleEvaluator();
  }

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

      // 1. 월 납입일(D-7, D-1) 탐색 (순수 도메인 규칙 엔진에 위임)
      const paymentCandidate = this.evaluator.checkPaymentDue(
        product,
        todayKst,
        year,
        month,
      );
      if (paymentCandidate) {
        candidates.push(paymentCandidate);
      }

      // 2. 만기일(D-30, D-7, D-Day) 탐색 (순수 도메인 규칙 엔진에 위임)
      const maturityCandidate = this.evaluator.checkMaturity(product, todayKst);
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

        // 방해금지 시간 및 채널 필터링 (순수 도메인 규칙 엔진에 위임)
        const userSettings = product.user.notificationSettings;
        const channel = this.evaluator.determineChannel(
          userSettings,
          targetDate,
        );

        // 1) DB 인앱 알림 레코드 생성
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

        // 2) 외부 채널(Email / Push / Kakao) 모의 발송 연동 (예외 격리)
        if (channel !== 'in_app') {
          await this.dispatchExternalChannel(
            channel,
            candidate,
            product.user.email,
          );
        }

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
   * 외부 채널(Email / Push / Kakao) 모의 발송 인터페이스 및 로깅
   */
  async dispatchExternalChannel(
    channel: string,
    candidate: BatchNotificationCandidate,
    userEmail?: string | null,
  ): Promise<void> {
    try {
      switch (channel) {
        case 'email':
          await this.sendEmail(
            userEmail ?? `user_${candidate.userId.toString()}@boim.local`,
            candidate.title,
            candidate.message,
          );
          break;
        case 'push':
          await this.sendPush(
            candidate.userId.toString(),
            candidate.title,
            candidate.message,
          );
          break;
        case 'kakao':
          await this.sendKakao(
            candidate.userId.toString(),
            candidate.title,
            candidate.message,
          );
          break;
        default:
          this.logger.warn(`지원되지 않는 알림 채널입니다: ${channel}`);
          break;
      }
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `외부 채널(${channel}) 발송 중 오류가 발생했으나 인앱 알림은 정상 보존되었습니다: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 이메일 발송 어댑터 (탈착형 EmailService 위임)
   */
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    if (!this.emailService) {
      this.logger.log(
        `[NotificationSchedulerService] EmailService가 주입되지 않아 이메일 발송을 스킵합니다. (수신: ${to})`,
      );
      return false;
    }
    return this.emailService.sendEmail(to, subject, body);
  }

  /**
   * 웹/모바일 푸시 발송 어댑터 (모의 전송 및 로깅)
   */
  async sendPush(
    userId: string,
    title: string,
    body: string,
  ): Promise<boolean> {
    await Promise.resolve();
    this.logger.log(
      `[WebPush 전송 완료] 대상 유저: ${userId} | 제목: ${title} | 내용: ${body.slice(0, 30)}...`,
    );
    return true;
  }

  /**
   * 카카오 알림톡 발송 어댑터 (모의 전송 및 로깅)
   */
  async sendKakao(
    userId: string,
    title: string,
    body: string,
  ): Promise<boolean> {
    await Promise.resolve();
    this.logger.log(
      `[카카오 알림톡 전송 완료] 대상 유저: ${userId} | 내용: ${title} | 본문: ${body.slice(0, 30)}...`,
    );
    return true;
  }

  // --- 하위 호환 위임 메서드 (Delegation to Evaluator) ---

  checkPaymentDue(
    product: EvaluatorProduct,
    todayKst: Date,
    currentYear: number,
    currentMonth: number,
  ): BatchNotificationCandidate | null {
    return this.evaluator.checkPaymentDue(
      product,
      todayKst,
      currentYear,
      currentMonth,
    );
  }

  checkMaturity(
    product: EvaluatorProduct,
    todayKst: Date,
  ): BatchNotificationCandidate | null {
    return this.evaluator.checkMaturity(product, todayKst);
  }

  determineChannel(
    settings: EvaluatorNotificationSettings | null,
    nowDate: Date,
  ): string {
    return this.evaluator.determineChannel(settings, nowDate);
  }

  isQuietTime(start: string, end: string, nowDate: Date): boolean {
    return this.evaluator.isQuietTime(start, end, nowDate);
  }
}
