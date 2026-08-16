import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockImplementation((payload) => {
              return `mockToken_${payload.sub}`;
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
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
      const mockUser = { id: BigInt(1), email: 'test@test.com', password: 'hashed_password' };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prismaService.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login('test@test.com', 'password', true);
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('mockToken_1');
    });

    it('should throw exception if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.login('test@test.com', 'password')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('reauthenticate', () => {
    it('should return success if password is correct', async () => {
      const mockUser = { id: BigInt(1), email: 'test@test.com', password: 'hashed_password' };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.reauthenticate('1', 'correct_password');
      expect(result.success).toBe(true);
      expect(result.message).toBe('재인증에 성공했습니다.');
    });

    it('should return failure if password is wrong', async () => {
      const mockUser = { id: BigInt(1), email: 'test@test.com', password: 'hashed_password' };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.reauthenticate('1', 'wrong');
      expect(result.success).toBe(false);
      expect(result.message).toBe('비밀번호가 일치하지 않습니다.');
    });
  });
});
