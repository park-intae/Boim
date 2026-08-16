import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  generateTokens(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    
    // Access Token (30일 설정은 모듈 단위에서 전역으로 지정되어 있음)
    const accessToken = this.jwtService.sign(payload);

    // Refresh Token 로직 뼈대 
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '60d' });

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password?: string, rememberMe?: boolean) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    
    if (user.password && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } else if (!user.password && password) {
      throw new UnauthorizedException('비밀번호가 설정되지 않은 계정입니다. 소셜 로그인을 이용해주세요.');
    }

    const payloadUser = { id: user.id.toString(), email: user.email! };
    const tokens = this.generateTokens(payloadUser);

    if (rememberMe) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });
    }

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  async reauthenticate(userId: string, password?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) {
      return { success: false, message: '사용자를 찾을 수 없습니다.' };
    }

    if (user.password && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, message: '비밀번호가 일치하지 않습니다.' };
      }
    } else {
      return { success: false, message: '비밀번호 검증을 할 수 없는 계정입니다.' };
    }
    
    return { success: true, message: '재인증에 성공했습니다.' };
  }
}
