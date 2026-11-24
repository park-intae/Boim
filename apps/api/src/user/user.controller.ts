import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithJwtUser } from '../auth/auth.controller';
import { UserService } from './user.service';
import type {
  UpdateUserDto,
  UpdatePasswordDto,
  UpdateNotificationSettingsDto,
} from '@boim/shared-types';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  private extractUserId(req?: RequestWithJwtUser): bigint {
    if (!req?.user?.userId) {
      throw new UnauthorizedException('인증 정보가 필요합니다.');
    }
    return BigInt(req.user.userId);
  }

  @Get('me')
  async getProfile(@Req() req?: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    const user = await this.userService.getUserById(userId);
    return {
      ...user,
      id: Number(user.id),
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
      ...user,
      id: Number(user.id),
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
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  }

  @Get('me/notifications/settings')
  async getNotificationSettings(@Req() req?: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    const settings = await this.userService.getNotificationSettings(userId);
    return {
      ...settings,
      id: Number(settings.id),
      userId: Number(settings.userId),
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
      ...settings,
      id: Number(settings.id),
      userId: Number(settings.userId),
    };
  }

  @Get('me/export')
  async exportData(@Req() req?: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    const data = await this.userService.exportData(userId);
    return {
      ...data,
      id: Number(data?.id),
    };
  }

  @Post('me/import')
  async importData(
    @Req() req: RequestWithJwtUser,
    @Body() data: Record<string, unknown>,
  ) {
    const userId = this.extractUserId(req);
    await this.userService.importData(userId, data);
    return { message: '데이터 가져오기가 완료되었습니다.' };
  }

  @Delete('me')
  async deleteAccount(@Req() req?: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    await this.userService.softDeleteUser(userId);
    return { message: '계정이 안전하게 탈퇴 처리되었습니다.' };
  }

  @Get('me/login-history')
  async getLoginHistory(@Req() req?: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    const history = await this.userService.getLoginHistory(userId);
    return history.map((h) => ({
      ...h,
      id: Number(h.id),
      userId: Number(h.userId),
    }));
  }
}
