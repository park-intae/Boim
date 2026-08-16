import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

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
    // 임시 모의 유저
    const user = { id: 'mock_user_1', email };

    const tokens = this.generateTokens(user);

    if (rememberMe) {
      // TODO: tokens.refreshToken을 DB의 user.refreshToken에 저장하여 기기 기억 구현
    }

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }
}
