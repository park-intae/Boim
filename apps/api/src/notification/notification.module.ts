import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { EmailService } from './email.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationSchedulerService, EmailService],
  exports: [NotificationService, NotificationSchedulerService, EmailService],
})
export class NotificationModule {}
