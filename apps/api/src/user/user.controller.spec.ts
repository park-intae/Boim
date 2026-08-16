import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn().mockResolvedValue({ id: 1n, email: 'test@example.com' }),
            updateUser: jest.fn().mockResolvedValue({ id: 1n, name: 'newName' }),
            updatePassword: jest.fn().mockResolvedValue(true),
            getNotificationSettings: jest.fn().mockResolvedValue({ id: 1n, userId: 1n }),
            updateNotificationSettings: jest.fn().mockResolvedValue({ id: 1n, userId: 1n, marketingPush: true }),
            exportData: jest.fn().mockResolvedValue({ id: 1n }),
            importData: jest.fn().mockResolvedValue(true),
            softDeleteUser: jest.fn().mockResolvedValue(true),
            getLoginHistory: jest.fn().mockResolvedValue([{ id: 1n, userId: 1n }]),
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

  it('getProfile should return user data', async () => {
    const res = await controller.getProfile({} as any);
    expect(res.success).toBe(true);
    expect(res.data.id).toBe(1);
  });

  it('updateProfile should return updated user', async () => {
    const res = await controller.updateProfile({} as any, { name: 'newName' });
    expect(res.success).toBe(true);
    expect(res.data.name).toBe('newName');
  });

  it('updatePassword should return success message', async () => {
    const res = await controller.updatePassword({} as any, { oldPassword: 'old', newPassword: 'new' });
    expect(res.success).toBe(true);
  });

  it('getNotificationSettings should return settings', async () => {
    const res = await controller.getNotificationSettings({} as any);
    expect(res.success).toBe(true);
  });

  it('updateNotificationSettings should return updated settings', async () => {
    const res = await controller.updateNotificationSettings({} as any, { marketingPush: true });
    expect(res.success).toBe(true);
  });

  it('exportData should return user data', async () => {
    const res = await controller.exportData();
    expect(res.success).toBe(true);
  });

  it('importData should return success', async () => {
    const res = await controller.importData({});
    expect(res.success).toBe(true);
  });

  it('deleteAccount should return success', async () => {
    const res = await controller.deleteAccount();
    expect(res.success).toBe(true);
  });

  it('getLoginHistory should return history array', async () => {
    const res = await controller.getLoginHistory();
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
  });
});
