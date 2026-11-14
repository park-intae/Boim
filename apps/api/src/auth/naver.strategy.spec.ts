import { Test, TestingModule } from '@nestjs/testing';
import { NaverStrategy } from './naver.strategy';
import { SocialAuthService } from './social-auth.service';

describe('NaverStrategy', () => {
  let strategy: NaverStrategy;
  let socialAuthService: {
    processSocialUser: jest.Mock;
    verifyLinkState: jest.Mock;
  };

  beforeEach(async () => {
    socialAuthService = {
      processSocialUser: jest.fn().mockResolvedValue({
        user: {
          id: '2',
          email: 'naver@example.com',
          name: 'Naver User',
          provider: 'naver',
          isPassVerified: false,
        },
        tokens: {
          accessToken: 'mock_naver_jwt_access',
          refreshToken: 'mock_naver_jwt_refresh',
        },
        isNew: false,
      }),
      verifyLinkState: jest.fn().mockReturnValue({ valid: false }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NaverStrategy,
        { provide: SocialAuthService, useValue: socialAuthService },
      ],
    }).compile();

    strategy = module.get<NaverStrategy>(NaverStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and call socialAuthService.processSocialUser', async () => {
    const profile = {
      id: 'naver_123',
      email: 'naver@example.com',
      name: 'Naver User',
    };

    let resultUser: unknown;
    const done = (_err: Error | null, user?: unknown) => {
      resultUser = user;
    };

    await strategy.validate('accessToken', 'refreshToken', profile, done);

    expect(socialAuthService.processSocialUser).toHaveBeenCalledWith(
      {
        provider: 'naver',
        providerId: 'naver_123',
        email: 'naver@example.com',
        name: 'Naver User',
      },
      undefined,
    );

    expect(resultUser).toEqual({
      user: {
        id: '2',
        email: 'naver@example.com',
        name: 'Naver User',
        provider: 'naver',
        isPassVerified: false,
      },
      tokens: {
        accessToken: 'mock_naver_jwt_access',
        refreshToken: 'mock_naver_jwt_refresh',
      },
      isNew: false,
      isLinked: false,
    });
  });

  it('should link to existing user when valid link state is present', async () => {
    socialAuthService.verifyLinkState.mockReturnValue({
      valid: true,
      userId: 'user_888',
      provider: 'naver',
    });

    const mockReq = {
      query: { state: 'link.naver.user_888.12345.nonce.sig' },
    };
    const profile = {
      id: 'naver_888',
      email: 'naver_linked@example.com',
      name: 'Naver Linked User',
    };

    let resultUser: unknown;
    const done = (_err: Error | null, user?: unknown) => {
      resultUser = user;
    };

    await strategy.validate(
      mockReq,
      'accessToken',
      'refreshToken',
      profile,
      done,
    );

    expect(socialAuthService.processSocialUser).toHaveBeenCalledWith(
      {
        provider: 'naver',
        providerId: 'naver_888',
        email: 'naver_linked@example.com',
        name: 'Naver Linked User',
      },
      'user_888',
    );

    expect(resultUser).toEqual(
      expect.objectContaining({
        isLinked: true,
      }),
    );
  });

  it('should handle errors by calling done with error', async () => {
    const error = new Error('Process social user failed');
    socialAuthService.processSocialUser.mockRejectedValueOnce(error);

    let errorResult: Error | null = null;
    let userResult: unknown = null;
    const done = (err: Error | null, user?: unknown) => {
      errorResult = err;
      userResult = user;
    };

    await strategy.validate('accessToken', 'refreshToken', { id: '123' }, done);

    expect(errorResult).toBe(error);
    expect(userResult).toBe(false);
  });
});
