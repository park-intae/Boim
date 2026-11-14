import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SocialAuthService, SocialAuthResult } from './social-auth.service';
import type {
  UpdateSocialPriorityDto,
  UpdatePrimaryAccountDto,
} from '@boim/shared-types';

export interface RequestWithSocialAuthResult extends Request {
  user: SocialAuthResult & { isLinked?: boolean };
}

export interface JwtUser {
  userId: string;
  email?: string;
}

export interface RequestWithJwtUser extends Request {
  user: JwtUser;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly socialAuthService: SocialAuthService,
  ) {}

  @Post('reauth')
  @UseGuards(AuthGuard('jwt'))
  async reauthenticate(
    @Req() req: RequestWithJwtUser,
    @Body('password') password?: string,
  ) {
    return this.authService.reauthenticate(req.user.userId, password);
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name?: string,
  ) {
    return this.authService.register(email, password, name);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password?: string,
    @Body('rememberMe') rememberMe?: boolean,
  ) {
    return this.authService.login(email, password, rememberMe);
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    let userId: string | undefined;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = this.authService.verifyToken(token);
      if (payload?.sub) {
        userId = payload.sub;
      }
    }

    return this.authService.logout(userId);
  }

  @Get('social/status')
  @UseGuards(AuthGuard('jwt'))
  async getSocialStatus(@Req() req: RequestWithJwtUser) {
    return this.authService.getSocialLinkStatus(req.user.userId);
  }

  @Patch('social/priority')
  @UseGuards(AuthGuard('jwt'))
  async updateSocialPriority(
    @Req() req: RequestWithJwtUser,
    @Body() dto: UpdateSocialPriorityDto,
  ) {
    return this.socialAuthService.updateProfilePriority(req.user.userId, dto);
  }

  @Patch('social/primary-account')
  @UseGuards(AuthGuard('jwt'))
  async updatePrimaryAccount(
    @Req() req: RequestWithJwtUser,
    @Body() dto: UpdatePrimaryAccountDto,
  ) {
    return this.socialAuthService.setPrimaryAccount(
      req.user.userId,
      dto.primaryAccountProvider,
    );
  }

  @Post('social/mock-link')
  @UseGuards(AuthGuard('jwt'))
  async mockLinkSocial(
    @Req() req: RequestWithJwtUser,
    @Body('provider') provider: 'kakao' | 'naver',
  ) {
    return this.authService.mockLinkSocial(req.user.userId, provider);
  }

  @Post('social/mock-unlink')
  @UseGuards(AuthGuard('jwt'))
  async mockUnlinkSocial(
    @Req() req: RequestWithJwtUser,
    @Body('provider') provider: 'kakao' | 'naver',
  ) {
    return this.authService.mockUnlinkSocial(req.user.userId, provider);
  }

  /**
   * 로그인된 사용자가 실제 카카오/네이버 계정 연동 인가를 시작하도록 302 리다이렉트합니다.
   */
  @Get('social/link/:provider')
  async initiateSocialLink(
    @Param('provider') provider: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    if (provider !== 'kakao' && provider !== 'naver') {
      throw new BadRequestException('지원하지 않는 소셜 로그인 제공자입니다.');
    }
    if (!token) {
      throw new UnauthorizedException('로그인 인증 토큰이 필요합니다.');
    }

    const decoded = this.authService.verifyToken(token);
    if (!decoded?.sub) {
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
    }

    const state = this.socialAuthService.generateLinkState(
      decoded.sub,
      provider,
    );

    if (provider === 'kakao') {
      const clientId = process.env.KAKAO_CLIENT_ID || 'mock-kakao-client-id';
      const redirectUri =
        process.env.KAKAO_CALLBACK_URL ||
        'http://localhost:4000/api/auth/kakao/callback';
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
      return res.redirect(kakaoAuthUrl);
    } else {
      const clientId = process.env.NAVER_CLIENT_ID || 'mock-naver-client-id';
      const redirectUri =
        process.env.NAVER_CALLBACK_URL ||
        'http://localhost:4000/api/auth/naver/callback';
      const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
      return res.redirect(naverAuthUrl);
    }
  }

  // ==================== 카카오 소셜 인증 ====================

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  kakaoAuth() {
    // AuthGuard가 카카오 인가 페이지로 리다이렉트합니다.
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  kakaoAuthCallback(
    @Req() req: RequestWithSocialAuthResult,
    @Res() res: Response,
  ) {
    const result = req.user;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (result?.isLinked) {
      return res.redirect(
        `${frontendUrl}/dashboard?tab=settings&social_link_success=kakao`,
      );
    }

    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.tokens.accessToken}&refreshToken=${result.tokens.refreshToken}`,
    );
  }

  @Post('kakao/login')
  async kakaoLogin(
    @Body('code') code: string,
    @Body('redirectUri') redirectUri?: string,
  ) {
    const accessToken = await this.socialAuthService.exchangeKakaoCode(
      code,
      redirectUri,
    );
    const profile = await this.socialAuthService.getKakaoProfile(accessToken);
    return this.socialAuthService.processSocialUser(profile);
  }

  @Post('kakao/link')
  @UseGuards(AuthGuard('jwt'))
  async kakaoLink(
    @Req() req: RequestWithJwtUser,
    @Body('code') code: string,
    @Body('redirectUri') redirectUri?: string,
  ) {
    const accessToken = await this.socialAuthService.exchangeKakaoCode(
      code,
      redirectUri,
    );
    const profile = await this.socialAuthService.getKakaoProfile(accessToken);
    return this.socialAuthService.processSocialUser(profile, req.user.userId);
  }

  @Post('kakao/unlink')
  @UseGuards(AuthGuard('jwt'))
  async kakaoUnlink(@Req() req: RequestWithJwtUser) {
    return this.socialAuthService.unlinkSocialAccount(req.user.userId, 'kakao');
  }

  // ==================== 네이버 소셜 인증 ====================

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  naverAuth() {
    // AuthGuard가 네이버 인가 페이지로 리다이렉트합니다.
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  naverAuthCallback(
    @Req() req: RequestWithSocialAuthResult,
    @Res() res: Response,
  ) {
    const result = req.user;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (result?.isLinked) {
      return res.redirect(
        `${frontendUrl}/dashboard?tab=settings&social_link_success=naver`,
      );
    }

    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.tokens.accessToken}&refreshToken=${result.tokens.refreshToken}`,
    );
  }

  @Post('naver/login')
  async naverLogin(@Body('code') code: string, @Body('state') state: string) {
    const accessToken = await this.socialAuthService.exchangeNaverCode(
      code,
      state,
    );
    const profile = await this.socialAuthService.getNaverProfile(accessToken);
    return this.socialAuthService.processSocialUser(profile);
  }

  @Post('naver/link')
  @UseGuards(AuthGuard('jwt'))
  async naverLink(
    @Req() req: RequestWithJwtUser,
    @Body('code') code: string,
    @Body('state') state: string,
  ) {
    const accessToken = await this.socialAuthService.exchangeNaverCode(
      code,
      state,
    );
    const profile = await this.socialAuthService.getNaverProfile(accessToken);
    return this.socialAuthService.processSocialUser(profile, req.user.userId);
  }

  @Post('naver/unlink')
  @UseGuards(AuthGuard('jwt'))
  async naverUnlink(@Req() req: RequestWithJwtUser) {
    return this.socialAuthService.unlinkSocialAccount(req.user.userId, 'naver');
  }
}
