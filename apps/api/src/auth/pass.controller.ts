import {
  Controller,
  Post,
  Body,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PassService } from './pass.service';
import { AuthService } from './auth.service';

@Controller('auth/pass')
export class PassController {
  constructor(
    private readonly passService: PassService,
    private readonly authService: AuthService,
  ) {}

  @Post('request')
  async requestVerification(@Body('phoneNumber') phoneNumber: string) {
    if (!phoneNumber) {
      throw new BadRequestException('전화번호를 입력해주세요.');
    }
    const transactionId =
      await this.passService.requestMockVerification(phoneNumber);
    return { transactionId };
  }

  @Post('verify')
  async verifyCode(
    @Req() req: Request,
    @Body('transactionId') transactionId: string,
    @Body('code') code: string,
  ) {
    if (!transactionId || !code) {
      throw new BadRequestException('요청 정보가 올바르지 않습니다.');
    }

    let userId: string | undefined;
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = this.authService.verifyToken(token);
      if (payload?.sub) {
        userId = payload.sub;
      }
    }

    return this.passService.verifyMockCode(transactionId, code, userId);
  }
}
