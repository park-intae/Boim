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

  async exportData(userId: bigint) {
    // 실제로는 사용자의 모든 데이터(보험, 캘린더 등)를 쿼리해서 반환해야 함
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { insuranceProducts: true } });
    return user;
  }

  async importData(userId: bigint, data: any) {
    // 임시 모의 로직
    return true;
  }

  async softDeleteUser(userId: bigint) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }
}
