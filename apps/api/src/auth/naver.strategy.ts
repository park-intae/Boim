import { Injectable, Optional } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver-v2';
import { SocialAuthService } from './social-auth.service';

export interface NaverProfilePayload {
  id: string;
  email?: string;
  name?: string;
  nickname?: string;
}

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    @Optional()
    private readonly socialAuthService?: SocialAuthService,
  ) {
    super({
      clientID: process.env.NAVER_CLIENT_ID || 'mock-naver-client-id',
      clientSecret: process.env.NAVER_CLIENT_SECRET || 'mock-naver-secret',
      callbackURL:
        process.env.NAVER_CALLBACK_URL ||
        'http://localhost:3000/api/auth/naver/callback',
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: NaverProfilePayload,
    done: (err: Error | null, user?: unknown) => void,
  ) {
    if (!this.socialAuthService) {
      done(null, {
        email: profile.email,
        name: profile.name,
        provider: 'naver',
        providerId: profile.id,
      });
      return;
    }

    try {
      const providerId = String(profile.id);
      const email = profile.email;
      const name = profile.name || profile.nickname || '네이버 사용자';

      const result = await this.socialAuthService.processSocialUser({
        provider: 'naver',
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
