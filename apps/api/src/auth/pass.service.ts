import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PassService {
  private readonly logger = new Logger(PassService.name);

  async requestMockVerification(phoneNumber: string): Promise<string> {
    const transactionId = `MOCK_TX_${Date.now()}`;
    const mockAuthCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    this.logger.log(`\n=========================================\n[PASS 간이 인증] 전화번호: ${phoneNumber}\n인증번호: ${mockAuthCode}\n(테스트 우회 코드: 000000)\n=========================================`);
    
    return transactionId;
  }

  async verifyMockCode(transactionId: string, code: string): Promise<boolean> {
    if (code === '000000') {
      return true;
    }
    return code === '123456';
  }
}
