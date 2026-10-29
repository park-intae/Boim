/* eslint-disable @typescript-eslint/unbound-method */
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
            sign: jest.fn().mockImplementation((payload: { sub: string }) => {
              return `mockToken_${payload.sub}`;
            }),
            verify: jest.fn().mockImplementation((token: string) => {
              if (token === 'valid_token') {
                return { sub: '1', email: 'test@test.com' };
              }
              throw new Error('invalid token');
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
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

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens.accessToken).toBe('mockToken_test-user-id');
    });
  });

  describe('verifyToken', () => {
    it('should return payload if token is valid', () => {
      const payload = service.verifyToken('valid_token');
      expect(payload).toEqual({ sub: '1', email: 'test@test.com' });
    });

    it('should return null if token is invalid or throws', () => {
      const payload = service.verifyToken('invalid_token');
      expect(payload).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear refresh token in database if userId is provided', async () => {
      (prismaService.user.update as jest.Mock).mockResolvedValue({ id: BigInt(1) });

      const result = await service.logout('1');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { refreshToken: null },
      });
      expect(result).toEqual({ message: '성공적으로 로그아웃되었습니다.' });
    });

    it('should return success message even if userId is not provided', async () => {
      const result = await service.logout();

      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(result).toEqual({ message: '성공적으로 로그아웃되었습니다.' });
    });
  });

  describe('register', () => {
    it('should create new user and return tokens with profile', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        id: BigInt(10),
        email: 'new@boim.com',
        name: '신규유저',
        isPassVerified: false,
      });

      const result = await service.register('new@boim.com', 'password123', '신규유저');
      expect(result.accessToken).toBe('mockToken_10');
      expect(result.user).toEqual({
        id: '10',
        email: 'new@boim.com',
        name: '신규유저',
        isPassVerified: false,
      });
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({ id: BigInt(1) });
      await expect(service.register('existing@boim.com', 'pw')).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should generate tokens and return success response', async () => {
      const mockUser = {
        id: BigInt(1),
        email: 'test@test.com',
        name: '테스트유저',
        isPassVerified: true,
        password: 'hashed_password',
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prismaService.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login('test@test.com', 'password', true);
      expect(result.accessToken).toBe('mockToken_1');
      expect(result.user).toEqual({
        id: '1',
        email: 'test@test.com',
        name: '테스트유저',
        isPassVerified: true,
      });
    });

    it('should throw exception if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.login('test@test.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('reauthenticate', () => {
    it('should return success if password is correct', async () => {
      const mockUser = {
        id: BigInt(1),
        email: 'test@test.com',
        password: 'hashed_password',
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.reauthenticate('1', 'correct_password');
      expect(result.success).toBe(true);
      expect(result.message).toBe('재인증에 성공했습니다.');
    });

    it('should return failure if password is wrong', async () => {
      const mockUser = {
        id: BigInt(1),
        email: 'test@test.com',
        password: 'hashed_password',
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.reauthenticate('1', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });
});
