import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PassVerificationSession {
  code: string;
  phoneNumber: string;
  createdAt: number;
  expiresAt: number;
}

export const PASS_TTL_MS = 3 * 60 * 1000; // 3분 (180초)
export const PASS_COOLDOWN_MS = 30 * 1000; // 30초 쿨다운

@Injectable()
export class PassService {
  private readonly logger = new Logger(PassService.name);
  private readonly sessions = new Map<string, PassVerificationSession>();
  private readonly lastRequestByPhone = new Map<string, number>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 세션 목록 조회 (테스트 및 모니터링용)
   */
  getSession(transactionId: string): PassVerificationSession | undefined {
    return this.sessions.get(transactionId);
  }

  /**
   * 수동 세션 주입 (단위 테스트 전용)
   */
  setSession(transactionId: string, session: PassVerificationSession): void {
    this.sessions.set(transactionId, session);
  }

  /**
   * 세션 전체 초기화 (테스트 격리용)
   */
  clearSessions(): void {
    this.sessions.clear();
    this.lastRequestByPhone.clear();
  }

  /**
   * 만료된 세션 자동 정리
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [txId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(txId);
      }
    }
  }

  /**
   * PASS 본인인증 번호 발송 요청
   */
  async requestMockVerification(phoneNumber: string): Promise<string> {
    const cleanedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      throw new BadRequestException('올바른 휴대폰 번호 형식을 입력해주세요.');
    }

    const now = Date.now();

    // 1. 재요청 쿨다운 검증 (30초)
    const lastRequest = this.lastRequestByPhone.get(cleanedPhone);
    if (lastRequest && now - lastRequest < PASS_COOLDOWN_MS) {
      const waitSeconds = Math.ceil(
        (PASS_COOLDOWN_MS - (now - lastRequest)) / 1000,
      );
      throw new BadRequestException(
        `인증번호가 이미 발송되었습니다. ${waitSeconds}초 후에 다시 시도해주세요.`,
      );
    }

    // 2. 만료 세션 정리
    this.cleanupExpiredSessions();

    // 3. 고유 트랜잭션 ID 및 6자리 난수 코드 생성
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    const transactionId = `PASS_TX_${now}_${randomSuffix}`;
    const authCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + PASS_TTL_MS;

    this.sessions.set(transactionId, {
      code: authCode,
      phoneNumber: cleanedPhone,
      createdAt: now,
      expiresAt,
    });
    this.lastRequestByPhone.set(cleanedPhone, now);

    this.logger.log(
      `\n=========================================\n` +
        `[PASS 실감형 본인인증 발송 안내]\n` +
        `• 휴대폰 번호: ${cleanedPhone}\n` +
        `• 발급 인증번호: ${authCode}\n` +
        `• 유효시간: 3분 (180초)\n` +
        `• 트랜잭션 ID: ${transactionId}\n` +
        `=========================================`,
    );

    return transactionId;
  }

  /**
   * PASS 인증번호 검증 (3분 TTL 및 1회용 파기)
   */
  async verifyMockCode(
    transactionId: string,
    code: string,
    userId?: string,
  ): Promise<{ message: string }> {
    const session = this.sessions.get(transactionId);

    // 1. 세션 존재 여부 확인
    if (!session) {
      throw new BadRequestException(
        '유효하지 않거나 이미 만료된 인증 요청입니다. 인증번호를 다시 요청해주세요.',
      );
    }

    const now = Date.now();

    // 2. 3분(180초) TTL 만료 여부 검증
    if (now > session.expiresAt) {
      this.sessions.delete(transactionId);
      throw new BadRequestException(
        '인증 유효시간(3분)이 만료되었습니다. 인증번호를 다시 요청해주세요.',
      );
    }

    // 3. 인증번호 일치 검증 (개발/테스트용 슈퍼코드 123456 / 000000 폴백 허용)
    const isMatched =
      session.code === code ||
      (process.env.NODE_ENV !== 'production' &&
        (code === '000000' || code === '123456'));

    if (!isMatched) {
      throw new BadRequestException('인증번호가 일치하지 않습니다.');
    }

    // 4. 보안 원칙: 검증 성공 즉시 세션 파기 (일회용 보장)
    this.sessions.delete(transactionId);

    // 5. 로그인 유저인 경우 PASS 인증 상태 업데이트
    if (userId) {
      try {
        await this.prisma.user.update({
          where: { id: BigInt(userId) },
          data: {
            isPassVerified: true,
            passCi: `mock_ci_${now}_${session.phoneNumber}`,
          },
        });
      } catch (e) {
        this.logger.warn(`사용자(${userId}) PASS 인증 정보 갱신 실패:`, e);
      }
    }

    return { message: 'PASS 본인인증이 완료되었습니다.' };
  }
}
