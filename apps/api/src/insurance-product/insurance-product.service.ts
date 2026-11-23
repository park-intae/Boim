import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsuranceProductDto } from './dto/create-insurance-product.dto';
import { UpdateInsuranceProductDto } from './dto/update-insurance-product.dto';

@Injectable()
export class InsuranceProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: bigint, dto: CreateInsuranceProductDto) {
    return this.prisma.insuranceProduct.create({
      data: {
        userId,
        category: dto.category,
        name: dto.name,
        institution: dto.institution,
        startDate: new Date(dto.startDate),
        maturityDate: new Date(dto.maturityDate),
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
    await this.findOne(userId, id);
    const { userId: _ignoredUserId, ...safeDto } =
      dto as UpdateInsuranceProductDto & {
        userId?: unknown;
      };
    const data: import('@prisma/client').Prisma.InsuranceProductUpdateInput = {
      ...safeDto,
    };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.maturityDate) data.maturityDate = new Date(dto.maturityDate);

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
