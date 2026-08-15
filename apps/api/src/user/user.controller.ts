import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from 'shared-types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getProfile(@Req() req: any) {
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
  async updateProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
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
}
