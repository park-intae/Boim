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

  async reauthenticate(userId: string, password?: string) {
    // 임시 모의 로직 (실제로는 DB에서 userId로 유저를 찾아 비밀번호를 검증)
    if (password === 'wrong') {
      return { success: false, message: '비밀번호가 일치하지 않습니다.' };
    }
    
    // 소셜 로그인 등 비밀번호가 없는 유저의 경우 추가적인 검증 로직이 들어갈 수 있음
    return { success: true, message: '재인증에 성공했습니다.' };
  }
}
