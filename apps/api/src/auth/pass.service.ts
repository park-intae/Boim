import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PassService {
  private readonly logger = new Logger(PassService.name);

  constructor(private readonly prisma: PrismaService) {}

  async requestMockVerification(phoneNumber: string): Promise<string> {
    const transactionId = `MOCK_TX_${Date.now()}`;
    const mockAuthCode = Math.floor(100000 + Math.random() * 900000).toString();

    this.logger.log(
      `\n=========================================\n[PASS 간이 인증] 전화번호: ${phoneNumber}\n인증번호: ${mockAuthCode}\n(테스트 우회 코드: 000000 또는 123456)\n=========================================`,
    );

    return transactionId;
  }

  async verifyMockCode(
    transactionId: string,
    code: string,
    userId?: string,
  ): Promise<{ message: string }> {
    const isValid = code === '000000' || code === '123456';
    if (!isValid) {
      throw new BadRequestException('인증번호가 일치하지 않습니다.');
    }

    if (userId) {
      try {
        await this.prisma.user.update({
          where: { id: BigInt(userId) },
          data: {
            isPassVerified: true,
            passCi: `mock_ci_${Date.now()}`,
          },
        });
      } catch (e) {
        this.logger.warn(`사용자(${userId}) PASS 인증 정보 갱신 실패:`, e);
      }
    }

    return { message: 'PASS 본인인증이 완료되었습니다.' };
  }
}
