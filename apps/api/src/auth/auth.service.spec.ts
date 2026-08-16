import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockImplementation((payload, options) => {
              return `mockToken_${payload.sub}`;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokens', () => {
    it('should return access and refresh tokens for a user', () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };
      const tokens = service.generateTokens(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens.accessToken).toBe('mockToken_test-user-id');
    });
  });

  describe('login', () => {
    it('should generate tokens and return success response', async () => {
      const result = await service.login('test@test.com', 'password', true);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('accessToken');
      expect(result.data).toHaveProperty('refreshToken');
      expect(result.data.accessToken).toBe('mockToken_mock_user_1');
    });
  });

  describe('reauthenticate', () => {
    it('should return success if password is correct', async () => {
      const result = await service.reauthenticate('user123', 'correct_password');
      expect(result.success).toBe(true);
      expect(result.message).toBe('재인증에 성공했습니다.');
    });

    it('should return failure if password is wrong', async () => {
      const result = await service.reauthenticate('user123', 'wrong');
      expect(result.success).toBe(false);
      expect(result.message).toBe('비밀번호가 일치하지 않습니다.');
    });
  });
});
