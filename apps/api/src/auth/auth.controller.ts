import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('email') email: string, 
    @Body('password') password?: string, 
    @Body('rememberMe') rememberMe?: boolean
  ) {
    return this.authService.login(email, password, rememberMe);
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth() {
    // AuthGuard가 카카오 로그인 페이지로 리다이렉트합니다.
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const tokens = this.authService.generateTokens({ 
      id: user.providerId, 
      email: user.email || ''
    });
    
    res.redirect(`http://localhost:5173/login?token=${tokens.accessToken}`);
  }

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth() {
    // AuthGuard가 네이버 로그인 페이지로 리다이렉트합니다.
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const tokens = this.authService.generateTokens({ 
      id: user.providerId, 
      email: user.email || ''
    });
    
    res.redirect(`http://localhost:5173/login?token=${tokens.accessToken}`);
  }
}
