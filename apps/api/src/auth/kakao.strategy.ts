import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      // TODO: 환경변수 연동 필요
      clientID: process.env.KAKAO_CLIENT_ID || 'mock-kakao-client-id',
      clientSecret: '', // 카카오는 Secret이 선택사항입니다
      callbackURL: process.env.KAKAO_CALLBACK_URL || 'http://localhost:3000/api/auth/kakao/callback',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const { _json } = profile;
    const user = {
      email: _json.kakao_account?.email,
      name: _json.properties?.nickname,
      provider: 'kakao',
      providerId: profile.id,
    };
    
    // TODO: 실제 DB를 조회하여 사용자가 있으면 반환, 없으면 회원가입 처리 로직 추가 필요
    done(null, user);
  }
}
