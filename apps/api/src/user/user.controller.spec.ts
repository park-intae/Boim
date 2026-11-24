import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import type { RequestWithJwtUser } from '../auth/auth.controller';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockReq = {
    user: { userId: '1', email: 'test@example.com' },
  } as RequestWithJwtUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserById: jest
              .fn()
              .mockResolvedValue({ id: 1n, email: 'test@example.com' }),
            updateUser: jest
              .fn()
              .mockResolvedValue({ id: 1n, name: 'newName' }),
            updatePassword: jest.fn().mockResolvedValue(true),
            getNotificationSettings: jest
              .fn()
              .mockResolvedValue({ id: 1n, userId: 1n }),
            updateNotificationSettings: jest
              .fn()
              .mockResolvedValue({ id: 1n, userId: 1n, marketingPush: true }),
            exportData: jest.fn().mockResolvedValue({ id: 1n }),
            importData: jest.fn().mockResolvedValue(true),
            softDeleteUser: jest.fn().mockResolvedValue(true),
            getLoginHistory: jest
              .fn()
              .mockResolvedValue([{ id: 1n, userId: 1n }]),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw UnauthorizedException when user is missing', async () => {
    await expect(
      controller.getProfile({} as RequestWithJwtUser),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('getProfile should return user data', async () => {
    const res = await controller.getProfile(mockReq);
    expect(res.id).toBe(1);
  });

  it('getProfile should use authenticated user ID when token is provided', async () => {
    const res = await controller.getProfile({
      user: { userId: '99', email: 'kakao_user@boim.internal' },
    } as any);
    expect(service.getUserById).toHaveBeenCalledWith(99n);
    expect(res.id).toBe(1);
  });

  it('updateProfile should return updated user', async () => {
    const res = await controller.updateProfile(mockReq, { name: 'newName' });
    expect(res.name).toBe('newName');
  });

  it('updatePassword should return success message', async () => {
    const res = await controller.updatePassword(mockReq, {
      oldPassword: 'old',
      newPassword: 'new',
    });
    expect(res.message).toContain('변경');
  });

  it('getNotificationSettings should return settings', async () => {
    const res = await controller.getNotificationSettings(mockReq);
    expect(res.id).toBe(1);
  });

  it('updateNotificationSettings should return updated settings', async () => {
    const res = await controller.updateNotificationSettings(mockReq, {
      marketingPush: true,
    });
    expect(res.id).toBe(1);
  });

  it('exportData should return user data', async () => {
    const res = await controller.exportData(mockReq);
    expect(res.id).toBe(1);
  });

  it('importData should return success', async () => {
    const res = await controller.importData(mockReq, {});
    expect(res.message).toContain('완료');
  });

  it('deleteAccount should return success', async () => {
    const res = await controller.deleteAccount(mockReq);
    expect(res.message).toContain('탈퇴');
  });

  it('getLoginHistory should return history array', async () => {
    const res = await controller.getLoginHistory(mockReq);
    expect(Array.isArray(res)).toBe(true);
  });
});
