import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsuranceProductDto } from './dto/create-insurance-product.dto';
import { UpdateInsuranceProductDto } from './dto/update-insurance-product.dto';

@Injectable()
export class InsuranceProductService {
  constructor(private readonly prisma: PrismaService) {}

  private parseValidDate(value: string, fieldName: string): Date {
    const parsed = new Date(value);
    if (!value || Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(
        `${fieldName}의 날짜 형식이 올바르지 않습니다.`,
      );
    }
    return parsed;
  }

  private validateAmounts(
    monthlyPayment?: number,
    coverageAmount?: number,
  ): void {
    if (
      monthlyPayment !== undefined &&
      (!Number.isFinite(monthlyPayment) || monthlyPayment < 0)
    ) {
      throw new BadRequestException('월 납입액은 0 이상의 숫자여야 합니다.');
    }
    if (
      coverageAmount !== undefined &&
      (!Number.isFinite(coverageAmount) || coverageAmount < 0)
    ) {
      throw new BadRequestException('보장 총액은 0 이상의 숫자여야 합니다.');
    }
  }

  async create(userId: bigint, dto: CreateInsuranceProductDto) {
    if (
      !dto.category?.trim() ||
      !dto.name?.trim() ||
      !dto.institution?.trim()
    ) {
      throw new BadRequestException(
        '카테고리, 상품명, 보험사명은 필수 입력 항목입니다.',
      );
    }
    const startDate = this.parseValidDate(dto.startDate, '가입 시작일');
    const maturityDate = this.parseValidDate(dto.maturityDate, '만기일');
    if (maturityDate < startDate) {
      throw new BadRequestException('만기일은 가입 시작일 이후여야 합니다.');
    }
    this.validateAmounts(dto.monthlyPayment, dto.coverageAmount);

    return this.prisma.insuranceProduct.create({
      data: {
        userId,
        category: dto.category.trim(),
        name: dto.name.trim(),
        institution: dto.institution.trim(),
        startDate,
        maturityDate,
        monthlyPayment: dto.monthlyPayment,
        coverageAmount: dto.coverageAmount,
      },
    });
  }

  async findAll(userId: bigint) {
    return this.prisma.insuranceProduct.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: bigint, id: number) {
    const product = await this.prisma.insuranceProduct.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(
        `해당 보험 상품(ID: ${id})을 찾을 수 없습니다.`,
      );
    }
    if (BigInt(product.userId) !== userId) {
      throw new ForbiddenException(
        '해당 보험 상품에 대한 접근 권한이 없습니다.',
      );
    }
    return product;
  }

  async update(userId: bigint, id: number, dto: UpdateInsuranceProductDto) {
    const existing = await this.findOne(userId, id);
    const { userId: _ignoredUserId, ...safeDto } =
      dto as UpdateInsuranceProductDto & {
        userId?: unknown;
      };
    this.validateAmounts(dto.monthlyPayment, dto.coverageAmount);

    const data: import('@prisma/client').Prisma.InsuranceProductUpdateInput = {
      ...safeDto,
    };
    const nextStart = dto.startDate
      ? this.parseValidDate(dto.startDate, '가입 시작일')
      : new Date(existing.startDate);
    const nextMaturity = dto.maturityDate
      ? this.parseValidDate(dto.maturityDate, '만기일')
      : new Date(existing.maturityDate);
    if (nextMaturity < nextStart) {
      throw new BadRequestException('만기일은 가입 시작일 이후여야 합니다.');
    }

    if (dto.startDate) data.startDate = nextStart;
    if (dto.maturityDate) data.maturityDate = nextMaturity;

    return this.prisma.insuranceProduct.update({
      where: { id },
      data,
    });
  }

  async remove(userId: bigint, id: number) {
    await this.findOne(userId, id);
    return this.prisma.insuranceProduct.delete({
      where: { id },
    });
  }
}
