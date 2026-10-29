/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            generateTokens: jest.fn().mockReturnValue({
              accessToken: 'mock_access_token',
              refreshToken: 'mock_refresh_token',
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
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const result = await controller.login(
        'test@test.com',
        'password123',
        true,
      );
      expect(authService.login).toHaveBeenCalledWith(
        'test@test.com',
        'password123',
        true,
      );
      expect(result.accessToken).toBe('mock_access_token');
      expect(result.user.name).toBe('테스트유저');
    });
  });

  describe('logout', () => {
    it('should extract userId from Bearer token and call authService.logout', async () => {
      const req = {
        headers: {
          authorization: 'Bearer mock_access_token',
        },
      } as unknown as import('express').Request;

      const result = await controller.logout(req);

      expect(authService.verifyToken).toHaveBeenCalledWith('mock_access_token');
      expect(authService.logout).toHaveBeenCalledWith('user123');
      expect(result).toEqual({ message: '성공적으로 로그아웃되었습니다.' });
    });

    it('should call authService.logout with undefined if no header is present', async () => {
      const req = {
        headers: {},
      } as unknown as import('express').Request;

      const result = await controller.logout(req);

      expect(authService.logout).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({ message: '성공적으로 로그아웃되었습니다.' });
    });
  });

  describe('reauthenticate', () => {
    it('should call authService.reauthenticate and return result', async () => {
      const req = {
        user: { userId: 'user123', email: 'test@test.com' },
      } as unknown as import('./auth.controller').RequestWithJwtUser;
      const result = await controller.reauthenticate(req, 'mypassword');
      expect(authService.reauthenticate).toHaveBeenCalledWith(
        'user123',
        'mypassword',
      );
      expect(result.success).toBe(true);
    });
  });

  describe('kakaoAuthCallback', () => {
    it('should generate token and redirect to frontend', async () => {
      const req = {
        user: { providerId: 'kakao123', email: 'test@kakao.com' },
      } as unknown as import('./auth.controller').RequestWithOAuthUser;
      const res = {
        redirect: jest.fn(),
      } as unknown as import('express').Response;

      controller.kakaoAuthCallback(req, res);

      expect(authService.generateTokens).toHaveBeenCalledWith({
        id: 'kakao123',
        email: 'test@kakao.com',
      });
      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:5173/login?token=mock_access_token',
      );
    });
  });

  describe('naverAuthCallback', () => {
    it('should generate token and redirect to frontend', async () => {
      const req = {
        user: { providerId: 'naver456', email: 'test@naver.com' },
      } as unknown as import('./auth.controller').RequestWithOAuthUser;
      const res = {
        redirect: jest.fn(),
      } as unknown as import('express').Response;

      controller.naverAuthCallback(req, res);

      expect(authService.generateTokens).toHaveBeenCalledWith({
        id: 'naver456',
        email: 'test@naver.com',
      });
      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:5173/login?token=mock_access_token',
      );
    });
  });
});
