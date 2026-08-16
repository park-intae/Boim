import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { KakaoStrategy } from './kakao.strategy';
import { NaverStrategy } from './naver.strategy';
import { PassController } from './pass.controller';
import { PassService } from './pass.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      // TODO: 환경변수(ConfigService) 연동
      secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
      // 요구사항: 토큰 유효기간 30일 적용
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController, PassController],
  providers: [AuthService, JwtStrategy, KakaoStrategy, NaverStrategy, PassService],
  exports: [AuthService],
})
export class AuthModule {}
