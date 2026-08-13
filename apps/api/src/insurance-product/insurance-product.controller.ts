import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InsuranceProductService } from './insurance-product.service';
import { CreateInsuranceProductDto } from './dto/create-insurance-product.dto';
import { UpdateInsuranceProductDto } from './dto/update-insurance-product.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Insurance Products (보험 상품)')
@Controller('insurance-products')
export class InsuranceProductController {
  constructor(private readonly insuranceProductService: InsuranceProductService) {}

  @Post()
  @ApiOperation({ summary: '새 보험 상품 등록' })
  create(@Body() dto: CreateInsuranceProductDto) {
    return this.insuranceProductService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '전체 보험 상품 목록 조회' })
  findAll() {
    return this.insuranceProductService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 보험 상품 상세 조회' })
  findOne(@Param('id') id: string) {
    return this.insuranceProductService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '특정 보험 상품 정보 수정' })
  update(@Param('id') id: string, @Body() dto: UpdateInsuranceProductDto) {
    return this.insuranceProductService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '특정 보험 상품 삭제' })
  remove(@Param('id') id: string) {
    return this.insuranceProductService.remove(+id);
  }
}
