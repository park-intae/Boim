import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth() {
    // AuthGuard가 카카오 로그인 페이지로 리다이렉트합니다.
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req, @Res() res) {
    // req.user는 KakaoStrategy의 validate에서 반환한 유저 객체입니다.
    const tokens = this.authService.generateTokens({ 
      id: req.user.providerId, 
      email: req.user.email || ''
    });
    
    // JWT 토큰을 프론트엔드로 전달하며 리다이렉트 (실제 운영 시 Cookie 전달 등 보안 고려)
    res.redirect(`http://localhost:5173/login?token=${tokens.accessToken}`);
  }

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth() {
    // AuthGuard가 네이버 로그인 페이지로 리다이렉트합니다.
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Req() req, @Res() res) {
    const tokens = this.authService.generateTokens({ 
      id: req.user.providerId, 
      email: req.user.email || ''
    });
    
    res.redirect(`http://localhost:5173/login?token=${tokens.accessToken}`);
  }
}
