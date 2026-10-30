import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) {
      // 미인증 또는 토큰 누락 시 데모 사용자 ID(1)로 폴백
      return { userId: '1' } as unknown as TUser;
    }
    return user;
  }
}
