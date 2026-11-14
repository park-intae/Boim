import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { SocialAuthService } from './social-auth.service';

export interface KakaoProfilePayload {
  id: string | number;
  _json?: {
    kakao_account?: {
      email?: string;
      profile?: { nickname?: string; profile_image_url?: string };
    };
    properties?: {
      nickname?: string;
      profile_image?: string;
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
      passReqToCallback: true,
    });
  }

  async validate(
    reqOrAccessToken: any,
    accessTokenOrRefreshToken: any,
    refreshTokenOrProfile: any,
    profileOrDone: any,
    doneParam?: (err: Error | null, user?: unknown) => void,
  ) {
    let req: any;
    let profile: KakaoProfilePayload;
    let done: (err: Error | null, user?: unknown) => void;

    if (typeof doneParam === 'function') {
      req = reqOrAccessToken;
      profile = profileOrDone;
      done = doneParam;
    } else {
      req = null;
      profile = refreshTokenOrProfile;
      done = profileOrDone;
    }

    try {
      const { _json } = profile;
      const providerId = String(profile.id);
      const email = _json?.kakao_account?.email;
      const name =
        _json?.kakao_account?.profile?.nickname ||
        _json?.properties?.nickname ||
        '카카오 사용자';
      const rawImage =
        _json?.kakao_account?.profile?.profile_image_url ||
        _json?.properties?.profile_image;
      const profileImage = rawImage
        ? rawImage.replace(/^http:\/\//i, 'https://')
        : undefined;

      const state = req?.query?.state as string | undefined;
      const linkVerification =
        typeof this.socialAuthService.verifyLinkState === 'function'
          ? this.socialAuthService.verifyLinkState(state)
          : { valid: false };

      const result = await this.socialAuthService.processSocialUser(
        {
          provider: 'kakao',
          providerId,
          email,
          name,
          profileImage,
        },
        linkVerification?.valid && linkVerification?.provider === 'kakao'
          ? linkVerification.userId
          : undefined,
      );

      done(null, {
        ...result,
        isLinked: Boolean(
          linkVerification?.valid && linkVerification?.provider === 'kakao',
        ),
      });
    } catch (error) {
      done(error as Error, false);
    }
  }
}
