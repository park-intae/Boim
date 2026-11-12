import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { SocialAuthService } from './social-auth.service';

export interface KakaoProfilePayload {
  id: string | number;
  _json?: {
    kakao_account?: {
      email?: string;
      profile?: { nickname?: string };
    };
    properties?: {
      nickname?: string;
    };
  };
}

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly socialAuthService: SocialAuthService) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID || 'mock-kakao-client-id',
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
      callbackURL:
        process.env.KAKAO_CALLBACK_URL ||
        'http://localhost:3000/api/auth/kakao/callback',
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: KakaoProfilePayload,
    done: (err: Error | null, user?: unknown) => void,
  ) {
    try {
      const { _json } = profile;
      const providerId = String(profile.id);
      const email = _json?.kakao_account?.email;
      const name =
        _json?.kakao_account?.profile?.nickname ||
        _json?.properties?.nickname ||
        '카카오 사용자';

      const result = await this.socialAuthService.processSocialUser({
        provider: 'kakao',
        providerId,
        email,
        name,
      });

      done(null, result);
    } catch (error) {
      done(error as Error, false);
    }
  }
}
