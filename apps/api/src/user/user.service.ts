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
}
