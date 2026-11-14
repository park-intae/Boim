import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/auth.controller';
import { UserService } from './user.service';
import type {
  UpdateUserDto,
  UpdatePasswordDto,
  UpdateNotificationSettingsDto,
} from '@boim/shared-types';

@Controller('users')
@UseGuards(OptionalJwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  private extractUserId(req?: RequestWithJwtUser): bigint {
    return BigInt(req?.user?.userId || '1');
  }

  @Get('me')
  async getProfile(@Req() req?: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
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
  async updateProfile(
    @Req() req: RequestWithJwtUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = this.extractUserId(req);
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
  async updatePassword(
    @Req() req: RequestWithJwtUser,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const userId = this.extractUserId(req);
    await this.userService.updatePassword(
      userId,
      updatePasswordDto.newPassword,
    );
    return {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  }

  @Get('me/notifications/settings')
  async getNotificationSettings(@Req() req?: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
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
  async updateNotificationSettings(
    @Req() req: RequestWithJwtUser,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    const userId = this.extractUserId(req);
    const settings = await this.userService.updateNotificationSettings(
      userId,
      dto,
    );
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
  async exportData(@Req() req?: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
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
  async importData(
    @Req() req: RequestWithJwtUser,
    @Body() data: Record<string, unknown>,
  ) {
    const userId = this.extractUserId(req);
    await this.userService.importData(userId, data);
    return { success: true, message: '데이터 가져오기가 완료되었습니다.' };
  }

  @Delete('me')
  async deleteAccount(@Req() req?: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    await this.userService.softDeleteUser(userId);
    return { success: true, message: '계정이 안전하게 탈퇴 처리되었습니다.' };
  }

  @Get('me/login-history')
  async getLoginHistory(@Req() req?: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    const history = await this.userService.getLoginHistory(userId);
    return {
      success: true,
      data: history.map((h) => ({
        ...h,
        id: Number(h.id),
        userId: Number(h.userId),
      })),
    };
  }
}
