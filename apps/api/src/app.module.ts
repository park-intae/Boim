import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { InsuranceProductModule } from './insurance-product/insurance-product.module';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PrismaModule, InsuranceProductModule, NotificationModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
