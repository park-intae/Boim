import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InsuranceProductService } from './insurance-product.service';
import { CreateInsuranceProductDto } from './dto/create-insurance-product.dto';
import { UpdateInsuranceProductDto } from './dto/update-insurance-product.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { RequestWithJwtUser } from '../auth/auth.controller';

@ApiTags('Insurance Products (보험 상품)')
@ApiBearerAuth()
@Controller('insurance-products')
@UseGuards(AuthGuard('jwt'))
export class InsuranceProductController {
  constructor(
    private readonly insuranceProductService: InsuranceProductService,
  ) {}

  private extractUserId(req?: RequestWithJwtUser): bigint {
    if (!req?.user?.userId) {
      throw new UnauthorizedException('인증 정보가 필요합니다.');
    }
    return BigInt(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: '새 보험 상품 등록' })
  create(
    @Req() req: RequestWithJwtUser,
    @Body() dto: CreateInsuranceProductDto,
  ) {
    const userId = this.extractUserId(req);
    return this.insuranceProductService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '내 보험 상품 목록 조회' })
  findAll(@Req() req: RequestWithJwtUser) {
    const userId = this.extractUserId(req);
    return this.insuranceProductService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 보험 상품 상세 조회' })
  findOne(@Req() req: RequestWithJwtUser, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    return this.insuranceProductService.findOne(userId, +id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '특정 보험 상품 정보 수정' })
  update(
    @Req() req: RequestWithJwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateInsuranceProductDto,
  ) {
    const userId = this.extractUserId(req);
    return this.insuranceProductService.update(userId, +id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '특정 보험 상품 삭제' })
  remove(@Req() req: RequestWithJwtUser, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    return this.insuranceProductService.remove(userId, +id);
  }
}
