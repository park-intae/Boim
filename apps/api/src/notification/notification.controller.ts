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
  Headers,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiPropertyOptional,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import type { RequestWithJwtUser } from '../auth/auth.controller';
import type { CreateNotificationDto } from '@boim/shared-types';

export class TriggerBatchDto {
  @ApiPropertyOptional({
    description:
      '배치 기준 일자 (YYYY-MM-DD 또는 ISO 문자열, 미입력 시 당일 KST)',
    example: '2026-11-04',
  })
  targetDate?: string;
}

@ApiTags('Notification (알림)')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly schedulerService: NotificationSchedulerService,
  ) {}

  private extractUserId(req?: RequestWithJwtUser): bigint {
    if (!req?.user?.userId) {
      throw new UnauthorizedException('인증 정보가 필요합니다.');
    }
    return BigInt(req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: '알림 목록 조회 (최신순)' })
  async findAll(@Req() req: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    return this.notificationService.findAll(userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: '모든 알림 읽음 처리' })
  async markAllAsRead(@Req() req: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    return this.notificationService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: '특정 알림 읽음 처리' })
  @ApiParam({ name: 'id', description: '알림 ID' })
  async markAsRead(@Req() req: RequestWithJwtUser, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    return this.notificationService.markAsRead(userId, BigInt(id));
  }

  @Delete(':id')
  @ApiOperation({ summary: '알림 삭제' })
  @ApiParam({ name: 'id', description: '알림 ID' })
  async remove(@Req() req: RequestWithJwtUser, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    await this.notificationService.remove(userId, BigInt(id));
    return true;
  }

  @Post()
  @ApiOperation({ summary: '알림 생성 (본인 계정)' })
  async createNotification(
    @Req() req: RequestWithJwtUser,
    @Body() dto: Partial<CreateNotificationDto>,
  ) {
    const userId = this.extractUserId(req);
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

  @Post('trigger-batch')
  @ApiOperation({
    summary: '보험 만기/납입일 알림 배치 수동 실행 (관리자/내부용)',
  })
  async triggerBatch(
    @Body() dto?: TriggerBatchDto,
    @Headers('x-batch-secret') batchSecret?: string,
  ) {
    const configuredSecret = process.env.BATCH_SECRET;
    if (
      process.env.NODE_ENV === 'production' &&
      (!configuredSecret || batchSecret !== configuredSecret)
    ) {
      throw new ForbiddenException('배치 실행 권한이 없습니다.');
    }
    const targetDate = dto?.targetDate ? new Date(dto.targetDate) : new Date();
    return this.schedulerService.runBatch(targetDate);
  }
}
