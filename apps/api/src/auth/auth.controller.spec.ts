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

  describe('kakaoAuthCallback', () => {
    it('should generate token and redirect to frontend', async () => {
      const req = { user: { providerId: 'kakao123', email: 'test@kakao.com' } };
      const res = { redirect: jest.fn() };

      await controller.kakaoAuthCallback(req, res);

      expect(authService.generateTokens).toHaveBeenCalledWith({ id: 'kakao123', email: 'test@kakao.com' });
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/login?token=mock_access_token');
    });
  });

  describe('naverAuthCallback', () => {
    it('should generate token and redirect to frontend', async () => {
      const req = { user: { providerId: 'naver456', email: 'test@naver.com' } };
      const res = { redirect: jest.fn() };

      await controller.naverAuthCallback(req, res);

      expect(authService.generateTokens).toHaveBeenCalledWith({ id: 'naver456', email: 'test@naver.com' });
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/login?token=mock_access_token');
    });
  });
});
