import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver-v2';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      // TODO: 환경변수 연동 필요
      clientID: process.env.NAVER_CLIENT_ID || 'mock-naver-client-id',
      clientSecret: process.env.NAVER_CLIENT_SECRET || 'mock-naver-secret',
      callbackURL: process.env.NAVER_CALLBACK_URL || 'http://localhost:3000/api/auth/naver/callback',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const user = {
      email: profile.email,
      name: profile.name,
      provider: 'naver',
      providerId: profile.id,
    };
    
    // TODO: 실제 DB를 조회하여 사용자가 있으면 반환, 없으면 회원가입 처리 로직 추가 필요
    done(null, user);
  }
}
