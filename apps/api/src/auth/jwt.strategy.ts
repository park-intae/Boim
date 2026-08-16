import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // TODO: 환경변수(ConfigService)를 통해 주입하도록 변경 필요
      secretOrKey: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    // request.user 객체에 할당될 정보
    return { userId: payload.sub, email: payload.email };
  }
}
