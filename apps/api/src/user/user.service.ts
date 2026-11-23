import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('비밀번호는 최소 8자 이상이어야 합니다.');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
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

  async updateNotificationSettings(
    userId: bigint,
    data: import('@boim/shared-types').UpdateNotificationSettingsDto,
  ) {
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        provider: true,
        isPassVerified: true,
        profileImage: true,
        createdAt: true,
        insuranceProducts: true,
      },
    });
    return user;
  }

  async importData(userId: bigint, data: Record<string, unknown>) {
    if (!data || typeof data !== 'object') {
      throw new BadRequestException('올바른 백업 데이터 형식이 아닙니다.');
    }

    const rawProducts = Array.isArray(data.insuranceProducts)
      ? data.insuranceProducts
      : Array.isArray(data.insurances)
        ? data.insurances
        : [];

    const validProducts = rawProducts.map((item) => {
      if (!item || typeof item !== 'object') {
        throw new BadRequestException(
          '보험 상품 항목 형식이 올바르지 않습니다.',
        );
      }
      const p = item as Record<string, unknown>;
      const startDate = new Date(
        typeof p.startDate === 'string' || typeof p.startDate === 'number'
          ? p.startDate
          : '',
      );
      const maturityDate = new Date(
        typeof p.maturityDate === 'string' || typeof p.maturityDate === 'number'
          ? p.maturityDate
          : '',
      );
      const monthlyPayment = Number(p.monthlyPayment ?? 0);
      const coverageAmount = Number(p.coverageAmount ?? 0);

      if (
        typeof p.category !== 'string' ||
        typeof p.name !== 'string' ||
        typeof p.institution !== 'string' ||
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(maturityDate.getTime()) ||
        !Number.isFinite(monthlyPayment) ||
        monthlyPayment < 0 ||
        !Number.isFinite(coverageAmount) ||
        coverageAmount < 0
      ) {
        throw new BadRequestException(
          '백업 데이터 내 보험 상품 필드가 유효하지 않습니다.',
        );
      }

      return {
        userId,
        category: p.category.trim(),
        name: p.name.trim(),
        institution: p.institution.trim(),
        startDate,
        maturityDate,
        monthlyPayment,
        coverageAmount: BigInt(Math.trunc(coverageAmount)),
      };
    });

    if (validProducts.length > 0) {
      await this.prisma.insuranceProduct.createMany({
        data: validProducts,
      });
    }
    return true;
  }

  async softDeleteUser(userId: bigint) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }

  async getLoginHistory(userId: bigint) {
    // 임시 모의 데이터 삽입 (테스트용)
    const count = await this.prisma.userLoginHistory.count({
      where: { userId },
    });
    if (count === 0) {
      await this.prisma.userLoginHistory.createMany({
        data: [
          {
            userId,
            device: 'iPhone 14 Pro',
            ipAddress: '192.168.0.1',
            location: '서울, 대한민국',
            loginAt: new Date(),
          },
          {
            userId,
            device: 'MacBook Pro 16"',
            ipAddress: '110.12.34.56',
            location: '서울, 대한민국',
            loginAt: new Date(Date.now() - 86400000),
          },
        ],
      });
    }

    return this.prisma.userLoginHistory.findMany({
      where: { userId },
      orderBy: { loginAt: 'desc' },
      take: 10,
    });
  }
}
