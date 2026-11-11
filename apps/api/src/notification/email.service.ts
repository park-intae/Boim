import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

/**
 * 독립 탈착형(Pluggable) 이메일 발송 서비스
 * - 시스템 설정(ENABLE_EMAIL_NOTIFICATION=false) 또는 모듈 탈착을 통해 손쉽게 비활성화 가능
 * - 상용 SMTP 및 Ethereal 가상 테스트 메일함 지원
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  /**
   * 테스트 또는 커스텀 트랜스포터 주입 (유닛 테스트 및 모킹용)
   */
  setTransporter(transporter: nodemailer.Transporter | null): void {
    this.transporter = transporter;
  }

  /**
   * 이메일 기능 활성화 여부 확인
   */
  isEnabled(): boolean {
    return process.env.ENABLE_EMAIL_NOTIFICATION !== 'false';
  }

  /**
   * Nodemailer 트랜스포터 획득 또는 지연 초기화
   */
  async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
      });
      return this.transporter;
    }

    // 테스트 환경에서는 네트워크 호출 방지를 위해 jsonTransport 기본 사용
    if (process.env.NODE_ENV === 'test') {
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      return this.transporter;
    }

    // 개발/로컬 환경용 Ethereal Mail 가상 계정 생성
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(
        `Ethereal 가상 SMTP 테스트 트랜스포터가 생성되었습니다 (${testAccount.user})`,
      );
    } catch {
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }

    return this.transporter;
  }

  /**
   * 이메일 발송 실행
   */
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    if (!this.isEnabled()) {
      this.logger.log(
        `[EmailService] 이메일 발송 기능이 비활성화 상태이므로 발송을 스킵합니다. (수신: ${to})`,
      );
      return false;
    }

    const transporter = await this.getTransporter();
    const from = process.env.SMTP_FROM || '"Boim 보험 알림" <noreply@boim.com>';

    const info = await transporter.sendMail({
      from,
      to,
      subject: `[Boim] ${subject}`,
      text: body,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5; font-size: 20px; font-weight: 700; margin: 0;">Boim 보험 관리 알림</h1>
          </div>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">${subject}</h2>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0; white-space: pre-line;">${body}</p>
          </div>
          <p style="font-size: 12px; color: #9ca3af; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            본 메일은 Boim 서비스에서 고객님의 가입 보험 상태에 따라 자동 발송된 안내 메일입니다.
          </p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      this.logger.log(`[Ethereal Mail 미리보기 URL]: ${previewUrl}`);
    }

    this.logger.log(
      `[Email 전송 완료] 수신: ${to} | 제목: ${subject} | MessageId: ${info.messageId ?? 'ok'}`,
    );
    return true;
  }
}
