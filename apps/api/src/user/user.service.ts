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
    // 임시 모의 로직 (현재 스키마에 password 필드가 없으므로 동작하는 척만 함)
    // 실제로는 해싱(bcrypt 등) 후 DB에 저장해야 함
    const user = await this.getUserById(id);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return true;
  }
}
