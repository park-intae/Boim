import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import type { Transporter } from 'nodemailer';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    service.setTransporter(null);
    delete process.env.ENABLE_EMAIL_NOTIFICATION;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
  });

  it('서비스가 정의되어 있어야 한다', () => {
    expect(service).toBeDefined();
  });

  it('ENABLE_EMAIL_NOTIFICATION="false"일 때 sendEmail은 발송을 스킵하고 false를 반환해야 한다 (기능 탈착 검증)', async () => {
    process.env.ENABLE_EMAIL_NOTIFICATION = 'false';

    const mockSendMail = jest.fn();
    service.setTransporter({
      sendMail: mockSendMail,
    } as unknown as Transporter);

    const result = await service.sendEmail('test@boim.com', '제목', '내용');

    expect(result).toBe(false);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('트랜스포터 주입 시 정상적으로 이메일을 발송하고 true를 반환해야 한다', async () => {
    const mockSendMail = jest.fn().mockResolvedValue({
      messageId: '<test-message-id@boim.com>',
    });
    service.setTransporter({
      sendMail: mockSendMail,
    } as unknown as Transporter);

    const result = await service.sendEmail(
      'user@boim.com',
      '보험료 납입 안내',
      '내일은 보험료 납입일입니다.',
    );

    expect(result).toBe(true);
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const callArg = mockSendMail.mock.calls[0][0];
    expect(callArg.to).toBe('user@boim.com');
    expect(callArg.subject).toContain('보험료 납입 안내');
    expect(callArg.text).toBe('내일은 보험료 납입일입니다.');
    expect(callArg.html).toContain('내일은 보험료 납입일입니다.');
  });

  it('SMTP_HOST 환경변수가 설정되어 있을 때 SMTP 트랜스포터를 생성해야 한다', async () => {
    process.env.SMTP_HOST = 'smtp.testserver.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';

    const transporter = await service.getTransporter();
    expect(transporter).toBeDefined();
  });
});
