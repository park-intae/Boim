import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SocialAuthService } from './social-auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { KakaoStrategy } from './kakao.strategy';
import { NaverStrategy } from './naver.strategy';
import { PassController } from './pass.controller';
import { PassService } from './pass.service';
import { PrismaModule } from '../prisma/prisma.module';
import { getJwtSecret } from '../common/config/env.validation';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getJwtSecret(),
        // 요구사항: 토큰 유효기간 30일 적용
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  controllers: [AuthController, PassController],
  providers: [
    AuthService,
    SocialAuthService,
    JwtStrategy,
    KakaoStrategy,
    NaverStrategy,
    PassService,
  ],
  exports: [AuthService, SocialAuthService],
})
export class AuthModule {}
