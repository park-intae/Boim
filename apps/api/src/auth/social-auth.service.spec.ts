import { Test, TestingModule } from '@nestjs/testing';
import { SocialAuthService } from './social-auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('SocialAuthService', () => {
  let service: SocialAuthService;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let authService: {
    generateTokens: jest.Mock;
  };

  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv };
    delete process.env.KAKAO_CLIENT_ID;
    delete process.env.NAVER_CLIENT_ID;

    prismaService = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    authService = {
      generateTokens: jest.fn().mockReturnValue({
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialAuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    service = module.get<SocialAuthService>(SocialAuthService);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exchangeKakaoCode', () => {
    it('should return mock token in test mode when KAKAO_CLIENT_ID is not set or mock', async () => {
      const token = await service.exchangeKakaoCode('auth_code_123');
      expect(token).toBe('mock_kakao_token_for_auth_code_123');
    });
  });

  describe('getKakaoProfile', () => {
    it('should return mock profile when token starts with mock prefix', async () => {
      const profile = await service.getKakaoProfile(
        'mock_kakao_token_for_test_code',
      );
      expect(profile).toEqual({
        provider: 'kakao',
        providerId: 'kakao_mock_test_code',
        email: 'kakao_test_code@mock.kakao.com',
        name: '카카오 테스트 유저',
      });
    });
  });

  describe('OAuth State CSRF Protection', () => {
    it('should generate valid state and verify it successfully', () => {
      const state = service.generateOAuthState();
      expect(typeof state).toBe('string');
      expect(state.split('.')).toHaveLength(3);

      const isValid = service.verifyOAuthState(state);
      expect(isValid).toBe(true);
    });

    it('should reject tampered or invalid state', () => {
      expect(service.verifyOAuthState(undefined)).toBe(false);
      expect(service.verifyOAuthState('invalid_state_format')).toBe(false);
      expect(service.verifyOAuthState('12345.abc.def')).toBe(false);

      const validState = service.generateOAuthState();
      const tampered = validState + 'tampered';
      expect(service.verifyOAuthState(tampered)).toBe(false);
    });

    it('should reject expired state (> 10 mins)', () => {
      const expiredTimestamp = Date.now() - 11 * 60 * 1000;
      const expiredState = `${expiredTimestamp}.random.mocksignature`;
      expect(service.verifyOAuthState(expiredState)).toBe(false);
    });
  });

  describe('exchangeNaverCode', () => {
    it('should return mock token in test mode when NAVER_CLIENT_ID is not set or mock', async () => {
      const token = await service.exchangeNaverCode(
        'naver_code_123',
        'random_state',
      );
      expect(token).toBe('mock_naver_token_for_naver_code_123');
    });
  });

  describe('getNaverProfile', () => {
    it('should return mock profile when token starts with mock prefix', async () => {
      const profile = await service.getNaverProfile(
        'mock_naver_token_for_naver_code',
      );
      expect(profile).toEqual({
        provider: 'naver',
        providerId: 'naver_mock_naver_code',
        email: 'naver_naver_code@mock.naver.com',
        name: '네이버 테스트 유저',
      });
    });
  });

  describe('processSocialUser', () => {
    it('should login existing user with providerId', async () => {
      const mockUser = {
        id: BigInt(1),
        email: 'user@kakao.com',
        name: '카카오 유저',
        provider: 'kakao',
        providerId: 'kakao:12345',
        isPassVerified: true,
      };

      prismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.processSocialUser({
        provider: 'kakao',
        providerId: '12345',
        email: 'user@kakao.com',
        name: '카카오 유저',
      });

      expect(result.isNew).toBe(false);
      expect(result.user.id).toBe('1');
      expect(result.tokens.accessToken).toBe('mock_access_token');
    });

    it('should auto-link if local user with same email exists', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);
      const existingEmailUser = {
        id: BigInt(2),
        email: 'user@boim.com',
        name: '보임 유저',
        provider: 'local',
        providerId: null,
        isPassVerified: false,
      };
      prismaService.user.findUnique.mockResolvedValue(existingEmailUser);
      prismaService.user.update.mockResolvedValue({
        ...existingEmailUser,
        providerId: 'kakao:12345',
      });

      const result = await service.processSocialUser({
        provider: 'kakao',
        providerId: '12345',
        email: 'user@boim.com',
      });

      expect(result.isNew).toBe(false);
      expect(result.user.id).toBe('2');
      expect(prismaService.user.update).toHaveBeenCalled();
    });

    it('should create new user if user does not exist', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);
      prismaService.user.findUnique.mockResolvedValue(null);
      const createdUser = {
        id: BigInt(3),
        email: 'new@kakao.com',
        name: '신규 유저',
        provider: 'kakao',
        providerId: 'kakao:99999',
        isPassVerified: false,
      };
      prismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.processSocialUser({
        provider: 'kakao',
        providerId: '99999',
        email: 'new@kakao.com',
        name: '신규 유저',
      });

      expect(result.isNew).toBe(true);
      expect(result.user.id).toBe('3');
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should link account to existing user when linkUserId is provided', async () => {
      const existingUser = {
        id: BigInt(10),
        email: 'link@boim.com',
        providerId: null,
      };
      prismaService.user.findUnique.mockResolvedValue(existingUser);
      prismaService.user.findFirst.mockResolvedValue(null); // No duplicate
      prismaService.user.update.mockResolvedValue({
        ...existingUser,
        providerId: 'kakao:55555',
      });

      const result = await service.processSocialUser(
        { provider: 'kakao', providerId: '55555' },
        '10',
      );

      expect(result.isNew).toBe(false);
      expect(prismaService.user.update).toHaveBeenCalled();
    });

    it('should throw ConflictException if social account is already linked to another user', async () => {
      prismaService.user.findUnique.mockResolvedValue({ id: BigInt(10) });
      prismaService.user.findFirst.mockResolvedValue({ id: BigInt(20) }); // duplicate exists

      await expect(
        service.processSocialUser(
          { provider: 'kakao', providerId: '55555' },
          '10',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('unlinkSocialAccount', () => {
    it('should unlink social account and update providerId', async () => {
      const user = {
        id: BigInt(10),
        provider: 'kakao',
        providerId: 'kakao:12345|naver:67890',
      };
      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.user.update.mockResolvedValue({
        ...user,
        provider: 'local',
        providerId: 'naver:67890',
      });

      const result = await service.unlinkSocialAccount('10', 'kakao');
      expect(result.linked).toBe(false);
      expect(result.provider).toBe('kakao');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: BigInt(10) },
        data: {
          provider: 'local',
          providerId: 'naver:67890',
          kakaoEmail: null,
          kakaoNickname: null,
          kakaoProfileImage: null,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.unlinkSocialAccount('999', 'kakao')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateProfilePriority', () => {
    it('should update preferred image and name providers and reflect them in profile', async () => {
      const user = {
        id: BigInt(10),
        name: '카카오이름',
        profileImage: 'https://kakao.com/thumb.jpg',
        kakaoNickname: '카카오이름',
        kakaoProfileImage: 'https://kakao.com/thumb.jpg',
        naverNickname: '네이버이름',
        naverProfileImage: 'https://naver.com/thumb.jpg',
        preferredImageProvider: 'kakao',
        preferredNameProvider: 'kakao',
      };
      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.user.update.mockResolvedValue({
        ...user,
        name: '네이버이름',
        profileImage: 'https://naver.com/thumb.jpg',
        preferredImageProvider: 'naver',
        preferredNameProvider: 'naver',
      });

      const result = await service.updateProfilePriority('10', {
        preferredImageProvider: 'naver',
        preferredNameProvider: 'naver',
      });

      expect(result.name).toBe('네이버이름');
      expect(result.profileImage).toBe('https://naver.com/thumb.jpg');
      expect(result.preferredImageProvider).toBe('naver');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: BigInt(10) },
        data: {
          preferredImageProvider: 'naver',
          profileImage: 'https://naver.com/thumb.jpg',
          preferredNameProvider: 'naver',
          name: '네이버이름',
        },
      });
    });

    it('should set profileImage to null when preferredImageProvider is default', async () => {
      const user = {
        id: BigInt(10),
        name: '카카오이름',
        profileImage: 'https://kakao.com/thumb.jpg',
        kakaoNickname: '카카오이름',
        kakaoProfileImage: 'https://kakao.com/thumb.jpg',
        naverNickname: null,
        naverProfileImage: null,
        preferredImageProvider: 'kakao',
        preferredNameProvider: 'kakao',
      };
      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.user.update.mockResolvedValue({
        ...user,
        profileImage: null,
        preferredImageProvider: 'default',
      });

      const result = await service.updateProfilePriority('10', {
        preferredImageProvider: 'default',
      });

      expect(result.profileImage).toBeNull();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: BigInt(10) },
        data: {
          preferredImageProvider: 'default',
          profileImage: null,
        },
      });
    });
  });

  describe('setPrimaryAccount', () => {
    it('should switch primary account to local and reset profile image', async () => {
      const user = {
        id: BigInt(10),
        name: '카카오이름',
        localNickname: '원래가입이름',
        kakaoNickname: '카카오이름',
        kakaoProfileImage: 'https://kakao.com/thumb.jpg',
        primaryAccountProvider: 'kakao',
      };
      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.user.update.mockResolvedValue({
        ...user,
        name: '원래가입이름',
        profileImage: null,
        primaryAccountProvider: 'local',
        preferredImageProvider: 'default',
        preferredNameProvider: 'custom',
      });

      const result = await service.setPrimaryAccount('10', 'local');

      expect(result.primaryAccountProvider).toBe('local');
      expect(result.name).toBe('원래가입이름');
      expect(result.profileImage).toBeNull();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: BigInt(10) },
        data: {
          primaryAccountProvider: 'local',
          name: '원래가입이름',
          profileImage: null,
          preferredImageProvider: 'default',
          preferredNameProvider: 'custom',
        },
      });
    });

    it('should switch primary account to kakao and sync avatar and name', async () => {
      const user = {
        id: BigInt(10),
        name: '원래가입이름',
        localNickname: '원래가입이름',
        kakaoNickname: '카카오라이언',
        kakaoProfileImage: 'https://kakao.com/lion.jpg',
        primaryAccountProvider: 'local',
      };
      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.user.update.mockResolvedValue({
        ...user,
        name: '카카오라이언',
        profileImage: 'https://kakao.com/lion.jpg',
        primaryAccountProvider: 'kakao',
        preferredImageProvider: 'kakao',
        preferredNameProvider: 'kakao',
      });

      const result = await service.setPrimaryAccount('10', 'kakao');

      expect(result.primaryAccountProvider).toBe('kakao');
      expect(result.name).toBe('카카오라이언');
      expect(result.profileImage).toBe('https://kakao.com/lion.jpg');
    });
  });

  describe('generateLinkState and verifyLinkState', () => {
    it('should generate valid HMAC signed link state and verify it successfully', () => {
      const state = service.generateLinkState('user_123', 'kakao');
      expect(state.startsWith('link.kakao.user_123.')).toBe(true);

      const verification = service.verifyLinkState(state);
      expect(verification.valid).toBe(true);
      expect(verification.userId).toBe('user_123');
      expect(verification.provider).toBe('kakao');
    });

    it('should reject tampered or invalid link state', () => {
      const state = service.generateLinkState('user_123', 'naver');
      const tampered = state.replace('user_123', 'user_999');

      const verification = service.verifyLinkState(tampered);
      expect(verification.valid).toBe(false);
    });

    it('should reject expired link state', () => {
      const pastTimestamp = Date.now() - 11 * 60 * 1000;
      const fakeState = `link.kakao.user_123.${pastTimestamp}.fakeNonce.fakeSig`;
      const verification = service.verifyLinkState(fakeState);
      expect(verification.valid).toBe(false);
    });
  });
});
