import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SocialAuthService } from './social-auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;
  let socialAuthService: any;

  beforeEach(async () => {
    authService = {
      generateTokens: jest.fn().mockReturnValue({
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
      }),
      register: jest.fn().mockResolvedValue({
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        user: {
          id: '10',
          email: 'new@boim.com',
          name: '신규유저',
          isPassVerified: false,
        },
      }),
      login: jest.fn().mockReturnValue({
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        user: {
          id: '1',
          email: 'test@test.com',
          name: '테스트유저',
          isPassVerified: true,
        },
      }),
      reauthenticate: jest.fn().mockResolvedValue({
        success: true,
        message: '재인증에 성공했습니다.',
      }),
      verifyToken: jest.fn().mockImplementation((token: string) => {
        if (token === 'mock_access_token') {
          return { sub: 'user123', email: 'test@test.com' };
        }
        return null;
      }),
      logout: jest.fn().mockResolvedValue({
        message: '성공적으로 로그아웃되었습니다.',
      }),
      getSocialLinkStatus: jest.fn().mockResolvedValue({
        kakao: { linked: true, email: 'test@kakao.com' },
        naver: { linked: false, email: null },
      }),
      mockLinkSocial: jest.fn().mockResolvedValue({
        message: '카카오 계정이 간이로 성공적으로 연동되었습니다.',
        provider: 'kakao',
        linked: true,
      }),
      mockUnlinkSocial: jest.fn().mockResolvedValue({
        message: '카카오 계정 연동이 성공적으로 해제되었습니다.',
        provider: 'kakao',
        linked: false,
      }),
    };

    socialAuthService = {
      exchangeKakaoCode: jest.fn().mockResolvedValue('mock_kakao_access_token'),
      getKakaoProfile: jest.fn().mockResolvedValue({
        provider: 'kakao',
        providerId: 'kakao_123',
        email: 'test@kakao.com',
        name: '카카오 유저',
      }),
      exchangeNaverCode: jest.fn().mockResolvedValue('mock_naver_access_token'),
      getNaverProfile: jest.fn().mockResolvedValue({
        provider: 'naver',
        providerId: 'naver_456',
        email: 'test@naver.com',
        name: '네이버 유저',
      }),
      processSocialUser: jest.fn().mockResolvedValue({
        user: {
          id: '1',
          email: 'test@kakao.com',
          name: '카카오 유저',
          provider: 'kakao',
          isPassVerified: false,
        },
        tokens: {
          accessToken: 'mock_jwt_access',
          refreshToken: 'mock_jwt_refresh',
        },
        isNew: false,
      }),
      unlinkSocialAccount: jest.fn().mockResolvedValue({
        message: '소셜 계정 연동이 성공적으로 해제되었습니다.',
        provider: 'kakao',
        linked: false,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: SocialAuthService, useValue: socialAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const result = await controller.register(
        'new@boim.com',
        'pw123',
        '신규유저',
      );
      expect(authService.register).toHaveBeenCalledWith(
        'new@boim.com',
        'pw123',
        '신규유저',
      );
      expect(result.accessToken).toBe('mock_access_token');
      expect(result.user.name).toBe('신규유저');
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const result = await controller.login(
        'test@test.com',
        'pw123',
        true,
      );
      expect(authService.login).toHaveBeenCalledWith(
        'test@test.com',
        'pw123',
        true,
      );
      expect(result.user.id).toBe('1');
    });
  });

  describe('logout', () => {
    it('should call authService.logout with userId if Bearer token present', async () => {
      const req = {
        headers: { authorization: 'Bearer mock_access_token' },
      } as any;
      const result = await controller.logout(req);
      expect(authService.verifyToken).toHaveBeenCalledWith('mock_access_token');
      expect(authService.logout).toHaveBeenCalledWith('user123');
      expect(result.message).toBe('성공적으로 로그아웃되었습니다.');
    });

    it('should call authService.logout with undefined if no Bearer token', async () => {
      const req = { headers: {} } as any;
      await controller.logout(req);
      expect(authService.logout).toHaveBeenCalledWith(undefined);
    });
  });

  describe('reauthenticate', () => {
    it('should call authService.reauthenticate with userId and password', async () => {
      const req = { user: { userId: '1' } } as any;
      const result = await controller.reauthenticate(req, 'pw123');
      expect(authService.reauthenticate).toHaveBeenCalledWith('1', 'pw123');
      expect(result.success).toBe(true);
    });
  });

  describe('kakaoAuthCallback', () => {
    it('should redirect to frontend with tokens from req.user', async () => {
      const req = {
        user: {
          user: { id: '1', email: 'test@kakao.com' },
          tokens: {
            accessToken: 'token_access',
            refreshToken: 'token_refresh',
          },
          isNew: false,
        },
      } as any;
      const res = { redirect: jest.fn() } as any;

      controller.kakaoAuthCallback(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?token=token_access&refreshToken=token_refresh',
      );
    });
  });

  describe('kakaoLogin', () => {
    it('should exchange code and process social user', async () => {
      const result = await controller.kakaoLogin('auth_code_123', 'http://localhost:5173');
      expect(socialAuthService.exchangeKakaoCode).toHaveBeenCalledWith('auth_code_123', 'http://localhost:5173');
      expect(socialAuthService.getKakaoProfile).toHaveBeenCalledWith('mock_kakao_access_token');
      expect(socialAuthService.processSocialUser).toHaveBeenCalled();
      expect(result.tokens.accessToken).toBe('mock_jwt_access');
    });
  });

  describe('kakaoLink', () => {
    it('should exchange code and link to current user', async () => {
      const req = { user: { userId: '10' } } as any;
      const result = await controller.kakaoLink(req, 'auth_code_123');
      expect(socialAuthService.exchangeKakaoCode).toHaveBeenCalledWith('auth_code_123', undefined);
      expect(socialAuthService.processSocialUser).toHaveBeenCalledWith(expect.anything(), '10');
      expect(result.tokens.accessToken).toBe('mock_jwt_access');
    });
  });

  describe('kakaoUnlink', () => {
    it('should call socialAuthService.unlinkSocialAccount', async () => {
      const req = { user: { userId: '10' } } as any;
      const result = await controller.kakaoUnlink(req);
      expect(socialAuthService.unlinkSocialAccount).toHaveBeenCalledWith('10', 'kakao');
      expect(result.linked).toBe(false);
    });
  });

  describe('naverAuthCallback', () => {
    it('should redirect to frontend with tokens from req.user', async () => {
      const req = {
        user: {
          user: { id: '2', email: 'test@naver.com' },
          tokens: {
            accessToken: 'naver_token_access',
            refreshToken: 'naver_token_refresh',
          },
          isNew: false,
        },
      } as any;
      const res = { redirect: jest.fn() } as any;

      controller.naverAuthCallback(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?token=naver_token_access&refreshToken=naver_token_refresh',
      );
    });
  });

  describe('naverLogin', () => {
    it('should exchange code with state and process social user', async () => {
      const result = await controller.naverLogin('naver_code_123', 'state_abc');
      expect(socialAuthService.exchangeNaverCode).toHaveBeenCalledWith('naver_code_123', 'state_abc');
      expect(socialAuthService.getNaverProfile).toHaveBeenCalledWith('mock_naver_access_token');
      expect(socialAuthService.processSocialUser).toHaveBeenCalled();
      expect(result.tokens.accessToken).toBe('mock_jwt_access');
    });
  });

  describe('naverLink', () => {
    it('should link naver account to current user', async () => {
      const req = { user: { userId: '10' } } as any;
      const result = await controller.naverLink(req, 'naver_code_123', 'state_abc');
      expect(socialAuthService.exchangeNaverCode).toHaveBeenCalledWith('naver_code_123', 'state_abc');
      expect(socialAuthService.processSocialUser).toHaveBeenCalledWith(expect.anything(), '10');
      expect(result.tokens.accessToken).toBe('mock_jwt_access');
    });
  });

  describe('naverUnlink', () => {
    it('should call socialAuthService.unlinkSocialAccount for naver', async () => {
      const req = { user: { userId: '10' } } as any;
      await controller.naverUnlink(req);
      expect(socialAuthService.unlinkSocialAccount).toHaveBeenCalledWith('10', 'naver');
    });
  });

  describe('social link status and mock endpoints', () => {
    it('should call getSocialLinkStatus with userId', async () => {
      const mockReq = { user: { userId: '1' } } as any;
      const result = await controller.getSocialStatus(mockReq);
      expect(authService.getSocialLinkStatus).toHaveBeenCalledWith('1');
      expect(result.kakao.linked).toBe(true);
    });

    it('should call mockLinkSocial with userId and provider', async () => {
      const mockReq = { user: { userId: '1' } } as any;
      const result = await controller.mockLinkSocial(mockReq, 'kakao');
      expect(authService.mockLinkSocial).toHaveBeenCalledWith('1', 'kakao');
      expect(result.linked).toBe(true);
    });

    it('should call mockUnlinkSocial with userId and provider', async () => {
      const mockReq = { user: { userId: '1' } } as any;
      const result = await controller.mockUnlinkSocial(mockReq, 'kakao');
      expect(authService.mockUnlinkSocial).toHaveBeenCalledWith('1', 'kakao');
      expect(result.linked).toBe(false);
    });
  });
});
