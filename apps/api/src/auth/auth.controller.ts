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

export interface OAuthUser {
  providerId: string;
  email?: string;
}

export interface RequestWithOAuthUser extends Request {
  user: OAuthUser;
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
  constructor(private readonly authService: AuthService) {}

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

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  kakaoAuth() {
    // AuthGuard가 카카오 로그인 페이지로 리다이렉트합니다.
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  kakaoAuthCallback(@Req() req: RequestWithOAuthUser, @Res() res: Response) {
    const user = req.user;
    const tokens = this.authService.generateTokens({
      id: user.providerId,
      email: user.email || '',
    });

    res.redirect(`http://localhost:5173/login?token=${tokens.accessToken}`);
  }

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  naverAuth() {
    // AuthGuard가 네이버 로그인 페이지로 리다이렉트합니다.
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  naverAuthCallback(@Req() req: RequestWithOAuthUser, @Res() res: Response) {
    const user = req.user;
    const tokens = this.authService.generateTokens({
      id: user.providerId,
      email: user.email || '',
    });

    res.redirect(`http://localhost:5173/login?token=${tokens.accessToken}`);
  }
}
