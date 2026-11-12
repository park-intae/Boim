import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SocialAuthService, SocialAuthResult } from './social-auth.service';

export interface RequestWithSocialAuthResult extends Request {
  user: SocialAuthResult;
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
