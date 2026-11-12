import { Test, TestingModule } from '@nestjs/testing';
import { KakaoStrategy } from './kakao.strategy';
import { SocialAuthService } from './social-auth.service';

describe('KakaoStrategy', () => {
  let strategy: KakaoStrategy;
  let socialAuthService: { processSocialUser: jest.Mock };

  beforeEach(async () => {
    socialAuthService = {
      processSocialUser: jest.fn().mockResolvedValue({
        user: {
          id: '1',
          email: 'kakao@example.com',
          name: 'Kakao User',
          provider: 'kakao',
          isPassVerified: false,
        },
        tokens: {
          accessToken: 'mock_kakao_jwt_access',
          refreshToken: 'mock_kakao_jwt_refresh',
        },
        isNew: false,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KakaoStrategy,
        { provide: SocialAuthService, useValue: socialAuthService },
      ],
    }).compile();

    strategy = module.get<KakaoStrategy>(KakaoStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and call socialAuthService.processSocialUser', async () => {
    const profile = {
      id: 'kakao_123',
      _json: {
        kakao_account: { email: 'kakao@example.com' },
        properties: { nickname: 'Kakao User' },
      },
    };

    let resultUser: unknown;
    const done = (_err: Error | null, user?: unknown) => {
      resultUser = user;
    };

    await strategy.validate('accessToken', 'refreshToken', profile, done);

    expect(socialAuthService.processSocialUser).toHaveBeenCalledWith({
      provider: 'kakao',
      providerId: 'kakao_123',
      email: 'kakao@example.com',
      name: 'Kakao User',
    });

    expect(resultUser).toEqual({
      user: {
        id: '1',
        email: 'kakao@example.com',
        name: 'Kakao User',
        provider: 'kakao',
        isPassVerified: false,
      },
      tokens: {
        accessToken: 'mock_kakao_jwt_access',
        refreshToken: 'mock_kakao_jwt_refresh',
      },
      isNew: false,
    });
  });
});
