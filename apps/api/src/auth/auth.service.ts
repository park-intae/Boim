import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

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

  verifyToken(token: string): { sub: string; email: string } | null {
    try {
      return this.jwtService.verify<{ sub: string; email: string }>(token);
    } catch {
      return null;
    }
  }

  async register(email: string, password: string, name?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || undefined,
        localEmail: email,
        localNickname: name || undefined,
        provider: 'local',
        primaryAccountProvider: 'local',
        preferredImageProvider: 'default',
        preferredNameProvider: 'custom',
        isPassVerified: false,
      },
    });

    const payloadUser = { id: user.id.toString(), email: user.email! };
    const tokens = this.generateTokens(payloadUser);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id.toString(),
        email: user.email!,
        name: user.name ?? undefined,
        isPassVerified: user.isPassVerified,
      },
    };
  }

  async logout(userId?: string) {
    if (userId) {
      try {
        await this.prisma.user.update({
          where: { id: BigInt(userId) },
          data: { refreshToken: null },
        });
      } catch {
        // 유저가 DB에 없거나 에러인 경우에도 로그아웃 자체는 정상 완료 처리
      }
    }
    return {
      message: '성공적으로 로그아웃되었습니다.',
    };
  }

  async login(email: string, password?: string, rememberMe?: boolean) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    if (user.password && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException(
          '이메일 또는 비밀번호가 올바르지 않습니다.',
        );
      }
    } else if (!user.password && password) {
      throw new UnauthorizedException(
        '비밀번호가 설정되지 않은 계정입니다. 소셜 로그인을 이용해주세요.',
      );
    }

    const payloadUser = { id: user.id.toString(), email: user.email! };
    const tokens = this.generateTokens(payloadUser);

    if (rememberMe) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id.toString(),
        email: user.email!,
        name: user.name ?? undefined,
        isPassVerified: user.isPassVerified,
      },
    };
  }

  async reauthenticate(userId: string, password?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    if (user.password && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
      }
    } else {
      throw new UnauthorizedException('비밀번호 검증을 할 수 없는 계정입니다.');
    }

    return { success: true, message: '재인증에 성공했습니다.' };
  }

  async getSocialLinkStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const providerIdStr = user.providerId || '';
    const isKakao =
      user.provider === 'kakao' || providerIdStr.includes('kakao:');
    const isNaver =
      user.provider === 'naver' || providerIdStr.includes('naver:');

    const prefix = user.email?.split('@')[0] || 'user';
    return {
      primaryAccountProvider:
        (user.primaryAccountProvider as 'local' | 'kakao' | 'naver') || 'local',
      localAccount: {
        email:
          user.localEmail || (user.provider === 'local' ? user.email : null),
        nickname:
          user.localNickname ||
          (user.provider === 'local' ? user.name : '기본 회원'),
      },
      kakao: {
        linked: isKakao,
        email: user.kakaoEmail || (isKakao ? `${prefix}@kakao.com` : null),
        nickname: user.kakaoNickname || (isKakao ? user.name : null),
        profileImage:
          user.kakaoProfileImage || (isKakao ? user.profileImage : null),
      },
      naver: {
        linked: isNaver,
        email: user.naverEmail || (isNaver ? `${prefix}@naver.com` : null),
        nickname: user.naverNickname || (isNaver ? user.name : null),
        profileImage:
          user.naverProfileImage || (isNaver ? user.profileImage : null),
      },
      preferredImageProvider:
        (user.preferredImageProvider as 'kakao' | 'naver' | 'default') ||
        'kakao',
      preferredNameProvider:
        (user.preferredNameProvider as 'kakao' | 'naver' | 'custom') || 'kakao',
    };
  }

  async mockLinkSocial(userId: string, provider: 'kakao' | 'naver') {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const currentIds = (user.providerId || '').split('|').filter(Boolean);
    const prefix = `${provider}:`;
    if (!currentIds.some((id) => id.startsWith(prefix))) {
      currentIds.push(`${prefix}mock_${provider}_${userId}`);
    }

    await this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: {
        providerId: currentIds.join('|'),
      },
    });

    const providerName = provider === 'kakao' ? '카카오' : '네이버';
    return {
      message: `${providerName} 계정이 간이로 성공적으로 연동되었습니다.`,
      provider,
      linked: true,
    };
  }

  async mockUnlinkSocial(userId: string, provider: 'kakao' | 'naver') {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const prefix = `${provider}:`;
    let currentIds = (user.providerId || '').split('|').filter(Boolean);
    currentIds = currentIds.filter((id) => !id.startsWith(prefix));

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
