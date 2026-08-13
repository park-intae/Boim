import { Module } from '@nestjs/common';
import { InsuranceProductService } from './insurance-product.service';
import { InsuranceProductController } from './insurance-product.controller';

@Module({
  controllers: [InsuranceProductController],
  providers: [InsuranceProductService],
})
export class InsuranceProductModule {}
