import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateUserDto } from '@boim/shared-types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      // Create a dummy user for development if not exists
      return this.prisma.user.create({
        data: { id, email: 'user@example.com', name: 'User' },
      });
    }
    return user;
  }

  async updateUser(id: bigint, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updatePassword(id: bigint, newPassword: string) {
    const user = await this.getUserById(id);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return true;
  }

  async getNotificationSettings(userId: bigint) {
    let settings = await this.prisma.userNotificationSettings.findUnique({
      where: { userId },
    });
    if (!settings) {
      settings = await this.prisma.userNotificationSettings.create({
        data: { userId },
      });
    }
    return settings;
  }

  async updateNotificationSettings(userId: bigint, data: import('@boim/shared-types').UpdateNotificationSettingsDto) {
    return this.prisma.userNotificationSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }
}
