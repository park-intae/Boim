import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver-v2';
import { SocialAuthService } from './social-auth.service';

export interface NaverProfilePayload {
  id: string;
  email?: string;
  name?: string;
  nickname?: string;
  profileImage?: string;
  profile_image?: string;
  _json?: {
    response?: {
      profile_image?: string;
      nickname?: string;
      name?: string;
      email?: string;
    };
  };
}

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly socialAuthService: SocialAuthService) {
    super({
      clientID: process.env.NAVER_CLIENT_ID || 'mock-naver-client-id',
      clientSecret: process.env.NAVER_CLIENT_SECRET || 'mock-naver-secret',
      callbackURL:
        process.env.NAVER_CALLBACK_URL ||
        'http://localhost:3000/api/auth/naver/callback',
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
    let profile: NaverProfilePayload;
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
      const providerId = String(profile.id);
      const email = profile.email;
      const name =
        profile.name ||
        profile.nickname ||
        profile._json?.response?.name ||
        profile._json?.response?.nickname ||
        '네이버 사용자';
      const rawImage =
        profile.profileImage ||
        profile.profile_image ||
        profile._json?.response?.profile_image;
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
          provider: 'naver',
          providerId,
          email,
          name,
          profileImage,
        },
        linkVerification?.valid && linkVerification?.provider === 'naver'
          ? linkVerification.userId
          : undefined,
      );

      done(null, {
        ...result,
        isLinked: Boolean(
          linkVerification?.valid && linkVerification?.provider === 'naver',
        ),
      });
    } catch (error) {
      done(error as Error, false);
    }
  }
}
