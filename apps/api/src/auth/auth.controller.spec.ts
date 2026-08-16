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
              success: true,
              data: {
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token',
              },
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
      const result = await controller.login('test@test.com', 'password123', true);
      expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password123', true);
      expect(result.data.accessToken).toBe('mock_access_token');
    });
  });

  describe('kakaoAuthCallback', () => {
    it('should generate token and redirect to frontend', async () => {
      const req = { user: { providerId: 'kakao123', email: 'test@kakao.com' } } as unknown as import('./auth.controller').RequestWithOAuthUser;
      const res = { redirect: jest.fn() } as unknown as import('express').Response;

      await controller.kakaoAuthCallback(req, res);

      expect(authService.generateTokens).toHaveBeenCalledWith({ id: 'kakao123', email: 'test@kakao.com' });
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/login?token=mock_access_token');
    });
  });

  describe('naverAuthCallback', () => {
    it('should generate token and redirect to frontend', async () => {
      const req = { user: { providerId: 'naver456', email: 'test@naver.com' } } as unknown as import('./auth.controller').RequestWithOAuthUser;
      const res = { redirect: jest.fn() } as unknown as import('express').Response;

      await controller.naverAuthCallback(req, res);

      expect(authService.generateTokens).toHaveBeenCalledWith({ id: 'naver456', email: 'test@naver.com' });
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/login?token=mock_access_token');
    });
  });
});
