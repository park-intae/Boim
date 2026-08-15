import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import type { UpdateUserDto } from '@boim/shared-types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getProfile(@Req() req: Request) {
    // TODO: JWT Auth Guard 연동 후 req.user.id 사용
    const userId = 1n; // 임시 하드코딩
    const user = await this.userService.getUserById(userId);
    return {
      success: true,
      data: {
        ...user,
        id: Number(user.id),
      },
    };
  }

  @Patch('me')
  async updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = 1n; // 임시 하드코딩
    const user = await this.userService.updateUser(userId, updateUserDto);
    return {
      success: true,
      data: {
        ...user,
        id: Number(user.id),
      },
    };
  }

  @Patch('me/password')
  async updatePassword(@Req() req: Request, @Body() updatePasswordDto: import('@boim/shared-types').UpdatePasswordDto) {
    const userId = 1n; // 임시 하드코딩
    await this.userService.updatePassword(userId, updatePasswordDto.newPassword);
    return {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  }

  @Get('me/notifications/settings')
  async getNotificationSettings(@Req() req: Request) {
    const userId = 1n;
    const settings = await this.userService.getNotificationSettings(userId);
    return {
      success: true,
      data: {
        ...settings,
        id: Number(settings.id),
        userId: Number(settings.userId),
      },
    };
  }

  @Patch('me/notifications/settings')
  async updateNotificationSettings(@Req() req: Request, @Body() dto: import('@boim/shared-types').UpdateNotificationSettingsDto) {
    const userId = 1n;
    const settings = await this.userService.updateNotificationSettings(userId, dto);
    return {
      success: true,
      data: {
        ...settings,
        id: Number(settings.id),
        userId: Number(settings.userId),
      },
    };
  }

  @Get('me/export')
  async exportData() {
    const userId = 1n; // 임시 하드코딩
    const data = await this.userService.exportData(userId);
    return {
      success: true,
      data: {
        ...data,
        id: Number(data?.id),
      },
    };
  }

  @Post('me/import')
  async importData(@Body() data: any) {
    const userId = 1n;
    await this.userService.importData(userId, data);
    return { success: true, message: '데이터 가져오기가 완료되었습니다.' };
  }

  @Delete('me')
  async deleteAccount() {
    const userId = 1n;
    await this.userService.softDeleteUser(userId);
    return { success: true, message: '계정이 안전하게 탈퇴 처리되었습니다.' };
  }
}
