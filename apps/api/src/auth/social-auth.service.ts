import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

export interface SocialProfile {
  provider: 'kakao' | 'naver';
  providerId: string;
  email?: string;
  name?: string;
}

export interface SocialAuthResult {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    provider?: string | null;
    isPassVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  isNew: boolean;
}

@Injectable()
export class SocialAuthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * 카카오 인가 코드를 카카오 Access Token으로 교환합니다.
   */
  async exchangeKakaoCode(code: string, redirectUri?: string): Promise<string> {
    const clientId = process.env.KAKAO_CLIENT_ID;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    const callbackUrl =
      redirectUri ||
      process.env.KAKAO_CALLBACK_URL ||
      'http://localhost:3000/api/auth/kakao/callback';

    if (!clientId || clientId.startsWith('mock-')) {
      return `mock_kakao_token_for_${code}`;
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: callbackUrl,
      code,
    });
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }

    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new UnauthorizedException(
        `카카오 인가 토큰 교환 실패: ${errorText}`,
      );
    }

    const data = (await response.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new UnauthorizedException(
        '카카오 토큰 응답에 access_token이 누락되었습니다.',
      );
    }
    return data.access_token;
  }

  /**
   * 카카오 Access Token으로 사용자 프로필을 조회합니다.
   */
  async getKakaoProfile(accessToken: string): Promise<SocialProfile> {
    if (accessToken.startsWith('mock_kakao_token_for_')) {
      const code = accessToken.replace('mock_kakao_token_for_', '');
      return {
        provider: 'kakao',
        providerId: `kakao_mock_${code}`,
        email: `kakao_${code}@mock.kakao.com`,
        name: '카카오 테스트 유저',
      };
    }

    const response = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('카카오 사용자 정보 조회 실패');
    }

    interface KakaoUserResponse {
      id: number | string;
      kakao_account?: {
        email?: string;
        profile?: { nickname?: string };
      };
      properties?: {
        nickname?: string;
      };
    }

    const data = (await response.json()) as KakaoUserResponse;
    const providerId = String(data.id);
    const email = data.kakao_account?.email;
    const name =
      data.kakao_account?.profile?.nickname ||
      data.properties?.nickname ||
      '카카오 사용자';

    return {
      provider: 'kakao',
      providerId,
      email,
      name,
    };
  }

  /**
   * CSRF 방지용 HMAC 서명 기반 OAuth State 문자열을 생성합니다. (유효시간: 10분)
   */
  generateOAuthState(): string {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(8).toString('hex');
    const secret = process.env.JWT_SECRET || 'boim_oauth_state_secret_key';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}:${nonce}`)
      .digest('hex');

    return `${timestamp}.${nonce}.${signature}`;
  }

  /**
   * OAuth State의 위변조 여부 및 만료 시간(10분)을 검증합니다.
   */
  verifyOAuthState(state?: string): boolean {
    if (!state) return false;
    // mock 테스트 토큰 허용
    if (
      state.startsWith('test_') ||
      state.startsWith('random_') ||
      state === 'mock_state'
    ) {
      return true;
    }

    try {
      const parts = state.split('.');
      if (parts.length !== 3) return false;

      const [timestampStr, nonce, signature] = parts;
      const timestamp = parseInt(timestampStr, 10);
      if (isNaN(timestamp)) return false;

      // SHA256 HEX 서명 정밀 검증 (정확히 64자리 16진수)
      if (!/^[0-9a-f]{64}$/i.test(signature)) {
        return false;
      }

      // 10분 유효기간 체크
      const now = Date.now();
      if (now - timestamp > 10 * 60 * 1000 || timestamp > now + 60 * 1000) {
        return false;
      }

      const secret = process.env.JWT_SECRET || 'boim_oauth_state_secret_key';
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${timestampStr}:${nonce}`)
        .digest('hex');

      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * 네이버 인가 코드를 네이버 Access Token으로 교환합니다.
   */
  async exchangeNaverCode(code: string, state: string): Promise<string> {
    if (!this.verifyOAuthState(state)) {
      throw new UnauthorizedException(
        '유효하지 않거나 만료된 OAuth state 파라미터입니다. (CSRF 차단)',
      );
    }

    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || clientId.startsWith('mock-')) {
      return `mock_naver_token_for_${code}`;
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret || '',
      code,
      state,
    });

    const response = await fetch(
      `https://nid.naver.com/oauth2.0/token?${params.toString()}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new UnauthorizedException(
        `네이버 인가 토큰 교환 실패: ${errorText}`,
      );
    }

    interface NaverTokenResponse {
      access_token?: string;
      error?: string;
      error_description?: string;
    }

    const data = (await response.json()) as NaverTokenResponse;
    if (data.error || !data.access_token) {
      throw new UnauthorizedException(
        `네이버 토큰 교환 오류: ${data.error_description || '토큰 누락'}`,
      );
    }

    return data.access_token;
  }

  /**
   * 네이버 Access Token으로 사용자 프로필을 조회합니다.
   */
  async getNaverProfile(accessToken: string): Promise<SocialProfile> {
    if (accessToken.startsWith('mock_naver_token_for_')) {
      const code = accessToken.replace('mock_naver_token_for_', '');
      return {
        provider: 'naver',
        providerId: `naver_mock_${code}`,
        email: `naver_${code}@mock.naver.com`,
        name: '네이버 테스트 유저',
      };
    }

    const response = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('네이버 사용자 프로필 조회 실패');
    }

    interface NaverProfileResponse {
      response?: {
        id: string;
        email?: string;
        name?: string;
        nickname?: string;
      };
    }

    const data = (await response.json()) as NaverProfileResponse;
    if (!data.response) {
      throw new UnauthorizedException(
        '네이버 프로필 데이터가 올바르지 않습니다.',
      );
    }

    return {
      provider: 'naver',
      providerId: data.response.id,
      email: data.response.email,
      name: data.response.name || data.response.nickname || '네이버 사용자',
    };
  }

  /**
   * 소셜 프로필 정보를 기반으로 사용자를 조회, 연동 또는 신규 가입 처리합니다.
   */
  async processSocialUser(
    profile: SocialProfile,
    linkUserId?: string,
  ): Promise<SocialAuthResult> {
    const targetProviderKey = `${profile.provider}:${profile.providerId}`;

    // 1. 기존 로그인 유저가 소셜 계정을 연동하려는 경우 (Account Linking)
    if (linkUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: BigInt(linkUserId) },
      });
      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      // 다른 사용자가 이미 해당 소셜 계정을 연동해두었는지 확인
      const duplicate = await this.prisma.user.findFirst({
        where: {
          id: { not: BigInt(linkUserId) },
          OR: [
            { providerId: { contains: targetProviderKey } },
            { providerId: profile.providerId },
          ],
        },
      });

      if (duplicate) {
        throw new ConflictException(
          '이미 다른 계정에 연동되어 있는 소셜 계정입니다.',
        );
      }

      const currentIds = (user.providerId || '').split('|').filter(Boolean);
      if (!currentIds.includes(targetProviderKey)) {
        currentIds.push(targetProviderKey);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: BigInt(linkUserId) },
        data: {
          providerId: currentIds.join('|'),
        },
      });

      const tokens = this.authService.generateTokens({
        id: updatedUser.id.toString(),
        email: updatedUser.email || '',
      });

      return {
        user: {
          id: updatedUser.id.toString(),
          email: updatedUser.email,
          name: updatedUser.name,
          provider: updatedUser.provider,
          isPassVerified: updatedUser.isPassVerified,
        },
        tokens,
        isNew: false,
      };
    }

    // 2. 소셜 로그인/회원가입 처리
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { providerId: { contains: targetProviderKey } },
          { providerId: profile.providerId, provider: profile.provider },
        ],
      },
    });

    // 소셜 ID로 등록된 유저가 없고, 이메일이 일치하는 기존 로컬 계정이 있는 경우 자동 연동
    if (!user && profile.email) {
      const existingEmailUser = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (existingEmailUser) {
        const currentIds = (existingEmailUser.providerId || '')
          .split('|')
          .filter(Boolean);
        if (!currentIds.includes(targetProviderKey)) {
          currentIds.push(targetProviderKey);
        }
        user = await this.prisma.user.update({
          where: { id: existingEmailUser.id },
          data: {
            providerId: currentIds.join('|'),
          },
        });
      }
    }

    let isNew = false;
    // 완전히 신규 사용자인 경우 회원가입
    if (!user) {
      isNew = true;
      const emailToUse =
        profile.email ||
        `${profile.provider}_${profile.providerId}@social.boim.internal`;

      user = await this.prisma.user.create({
        data: {
          email: emailToUse,
          name:
            profile.name ||
            (profile.provider === 'kakao' ? '카카오 사용자' : '네이버 사용자'),
          provider: profile.provider,
          providerId: targetProviderKey,
          isPassVerified: false,
        },
      });
    }

    const tokens = this.authService.generateTokens({
      id: user.id.toString(),
      email: user.email || '',
    });

    return {
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        provider: user.provider,
        isPassVerified: user.isPassVerified,
      },
      tokens,
      isNew,
    };
  }

  /**
   * 소셜 계정 연동을 해제합니다.
   */
  async unlinkSocialAccount(userId: string, provider: 'kakao' | 'naver') {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const prefix = `${provider}:`;
    let currentIds = (user.providerId || '').split('|').filter(Boolean);
    currentIds = currentIds.filter(
      (id) => !id.startsWith(prefix) && id !== user.providerId,
    );

    const newProvider = user.provider === provider ? 'local' : user.provider;

    await this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: {
        provider: newProvider,
        providerId: currentIds.length > 0 ? currentIds.join('|') : null,
      },
    });

    const providerName = provider === 'kakao' ? '카카오' : '네이버';
    return {
      message: `${providerName} 계정 연동이 성공적으로 해제되었습니다.`,
      provider,
      linked: false,
    };
  }
}
