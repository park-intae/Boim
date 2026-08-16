import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            userNotificationSettings: {
              findUnique: jest.fn(),
              create: jest.fn(),
              upsert: jest.fn(),
            },
            userLoginHistory: {
              count: jest.fn(),
              createMany: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getUserById should return user', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 1n, email: 'test@test.com' } as any);
    const user = await service.getUserById(1n);
    expect(user).toEqual({ id: 1n, email: 'test@test.com' });
  });

  it('getUserById should create dummy user if not exists', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.user, 'create').mockResolvedValue({ id: 1n, email: 'user@example.com' } as any);
    const user = await service.getUserById(1n);
    expect(user.email).toBe('user@example.com');
  });

  it('updateUser should call update', async () => {
    jest.spyOn(prisma.user, 'update').mockResolvedValue({ id: 1n, name: 'newName' } as any);
    const user = await service.updateUser(1n, { name: 'newName' });
    expect(user.name).toBe('newName');
  });

  it('updatePassword should return true if user exists', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 1n } as any);
    const result = await service.updatePassword(1n, 'newPass');
    expect(result).toBe(true);
  });

  it('updatePassword should throw NotFoundException if user not exists', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.user, 'create').mockResolvedValue(null);
    await expect(service.updatePassword(1n, 'newPass')).rejects.toThrow(NotFoundException);
  });

  it('getNotificationSettings should return settings', async () => {
    jest.spyOn(prisma.userNotificationSettings, 'findUnique').mockResolvedValue({ userId: 1n } as any);
    const settings = await service.getNotificationSettings(1n);
    expect(settings).toEqual({ userId: 1n });
  });

  it('getNotificationSettings should create if not exists', async () => {
    jest.spyOn(prisma.userNotificationSettings, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.userNotificationSettings, 'create').mockResolvedValue({ userId: 1n } as any);
    const settings = await service.getNotificationSettings(1n);
    expect(settings.userId).toBe(1n);
  });

  it('updateNotificationSettings should call upsert', async () => {
    jest.spyOn(prisma.userNotificationSettings, 'upsert').mockResolvedValue({ userId: 1n, marketingPush: true } as any);
    const result = await service.updateNotificationSettings(1n, { marketingPush: true });
    expect(result.marketingPush).toBe(true);
  });

  it('exportData should return user with relations', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 1n } as any);
    const data = await service.exportData(1n);
    expect(data.id).toBe(1n);
  });

  it('importData should return true', async () => {
    const data = await service.importData(1n, {});
    expect(data).toBe(true);
  });

  it('softDeleteUser should set deletedAt', async () => {
    jest.spyOn(prisma.user, 'update').mockResolvedValue({ id: 1n, deletedAt: new Date() } as any);
    const user = await service.softDeleteUser(1n);
    expect(user.deletedAt).toBeDefined();
  });

  it('getLoginHistory should return list', async () => {
    jest.spyOn(prisma.userLoginHistory, 'count').mockResolvedValue(1);
    jest.spyOn(prisma.userLoginHistory, 'findMany').mockResolvedValue([{ id: 1n }] as any);
    const history = await service.getLoginHistory(1n);
    expect(history.length).toBe(1);
  });

  it('getLoginHistory should create dummy if 0', async () => {
    jest.spyOn(prisma.userLoginHistory, 'count').mockResolvedValue(0);
    jest.spyOn(prisma.userLoginHistory, 'createMany').mockResolvedValue({ count: 2 } as any);
    jest.spyOn(prisma.userLoginHistory, 'findMany').mockResolvedValue([{ id: 1n }] as any);
    const history = await service.getLoginHistory(1n);
    expect(history.length).toBe(1);
  });
});
