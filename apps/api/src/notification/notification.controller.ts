import { Controller, Get, Delete, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll() {
    return {
      success: true,
      data: this.notificationService.findAll()
    };
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    const data = this.notificationService.markAsRead(id);
    return { success: true, data };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.notificationService.remove(id);
    return { success: true };
  }
}
