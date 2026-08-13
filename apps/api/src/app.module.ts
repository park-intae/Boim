import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { InsuranceProductModule } from './insurance-product/insurance-product.module';

@Module({
  imports: [PrismaModule, InsuranceProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
