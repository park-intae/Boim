import { Controller, Post, Body } from '@nestjs/common';
import { PassService } from './pass.service';

@Controller('auth/pass')
export class PassController {
  constructor(private readonly passService: PassService) {}

  @Post('request')
  async requestVerification(@Body('phoneNumber') phoneNumber: string) {
    if (!phoneNumber) {
      return { success: false, message: '전화번호를 입력해주세요.' };
    }
    const transactionId = await this.passService.requestMockVerification(phoneNumber);
    return { success: true, data: { transactionId } };
  }

  @Post('verify')
  async verifyCode(@Body('transactionId') transactionId: string, @Body('code') code: string) {
    const isValid = await this.passService.verifyMockCode(transactionId, code);
    if (isValid) {
      return { success: true, message: 'PASS 본인인증이 완료되었습니다.' };
    }
    return { success: false, message: '인증번호가 일치하지 않습니다.' };
  }
}
