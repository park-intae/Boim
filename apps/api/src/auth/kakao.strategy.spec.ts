import { Test, TestingModule } from '@nestjs/testing';
import { KakaoStrategy } from './kakao.strategy';
import { SocialAuthService } from './social-auth.service';

describe('KakaoStrategy', () => {
  let strategy: KakaoStrategy;
  let socialAuthService: {
    processSocialUser: jest.Mock;
    verifyLinkState: jest.Mock;
  };

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
      verifyLinkState: jest.fn().mockReturnValue({ valid: false }),
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

    expect(socialAuthService.processSocialUser).toHaveBeenCalledWith(
      {
        provider: 'kakao',
        providerId: 'kakao_123',
        email: 'kakao@example.com',
        name: 'Kakao User',
      },
      undefined,
    );

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
      isLinked: false,
    });
  });

  it('should link to existing user when valid link state is present', async () => {
    socialAuthService.verifyLinkState.mockReturnValue({
      valid: true,
      userId: 'user_999',
      provider: 'kakao',
    });

    const mockReq = {
      query: { state: 'link.kakao.user_999.12345.nonce.sig' },
    };
    const profile = {
      id: 'kakao_999',
      _json: {
        kakao_account: { email: 'kakao_linked@example.com' },
        properties: { nickname: 'Kakao Linked User' },
      },
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
        provider: 'kakao',
        providerId: 'kakao_999',
        email: 'kakao_linked@example.com',
        name: 'Kakao Linked User',
      },
      'user_999',
    );

    expect(resultUser).toEqual(
      expect.objectContaining({
        isLinked: true,
      }),
    );
  });

  it('should call done with error when processSocialUser throws and promote http image to https', async () => {
    const err = new Error('Kakao processing error');
    socialAuthService.processSocialUser.mockRejectedValueOnce(err);

    let capturedErr: Error | null = null;
    let capturedUser: unknown = null;
    await strategy.validate(
      'access',
      'refresh',
      {
        id: '123',
        _json: {
          properties: { profile_image: 'http://k.kakaocdn.net/img.jpg' },
        },
      },
      (e: Error | null, u?: unknown) => {
        capturedErr = e;
        capturedUser = u;
      },
    );

    expect(socialAuthService.processSocialUser).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '카카오 사용자',
        profileImage: 'https://k.kakaocdn.net/img.jpg',
      }),
      undefined,
    );
    expect(capturedErr).toBe(err);
    expect(capturedUser).toBe(false);
  });
});
