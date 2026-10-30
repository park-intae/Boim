import {
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import type { RequestWithJwtUser } from '../auth/auth.controller';
import type { CreateNotificationDto } from '@boim/shared-types';

@ApiTags('Notification (알림)')
@Controller('notifications')
@UseGuards(OptionalJwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '알림 목록 조회 (최신순)' })
  async findAll(@Req() req: RequestWithJwtUser) {
    const userId = BigInt(req.user?.userId || '1');
    return this.notificationService.findAll(userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: '모든 알림 읽음 처리' })
  async markAllAsRead(@Req() req: RequestWithJwtUser) {
    const userId = BigInt(req.user?.userId || '1');
    return this.notificationService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: '특정 알림 읽음 처리' })
  @ApiParam({ name: 'id', description: '알림 ID' })
  async markAsRead(@Req() req: RequestWithJwtUser, @Param('id') id: string) {
    const userId = BigInt(req.user?.userId || '1');
    return this.notificationService.markAsRead(userId, BigInt(id));
  }

  @Delete(':id')
  @ApiOperation({ summary: '알림 삭제' })
  @ApiParam({ name: 'id', description: '알림 ID' })
  async remove(@Req() req: RequestWithJwtUser, @Param('id') id: string) {
    const userId = BigInt(req.user?.userId || '1');
    await this.notificationService.remove(userId, BigInt(id));
    return true;
  }

  @Post()
  @ApiOperation({ summary: '알림 생성 (테스트/내부용)' })
  async createNotification(
    @Req() req: RequestWithJwtUser,
    @Body() dto: Partial<CreateNotificationDto>,
  ) {
    const userId = BigInt(dto.userId || req.user?.userId || '1');
    return this.notificationService.createNotification({
      userId,
      productId: dto.productId ? BigInt(dto.productId) : null,
      type: dto.type || 'info',
      title: dto.title || '새 알림',
      message: dto.message || '',
      channel: dto.channel || 'in_app',
      isRead: false,
    });
  }
}
