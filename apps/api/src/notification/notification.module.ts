import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { EmailService } from './email.service';
import { NotificationRuleEvaluator } from './notification-rule.evaluator';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationSchedulerService,
    EmailService,
    NotificationRuleEvaluator,
  ],
  exports: [
    NotificationService,
    NotificationSchedulerService,
    EmailService,
    NotificationRuleEvaluator,
  ],
})
export class NotificationModule {}
