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
    // TODO: Refresh Token의 경우 별도의 긴 만료기한을 주거나, Redis 등에 저장하여 관리해야 합니다.
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '60d' });

    return {
      accessToken,
      refreshToken,
    };
  }
}
