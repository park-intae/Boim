import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsuranceProductDto } from './dto/create-insurance-product.dto';
import { UpdateInsuranceProductDto } from './dto/update-insurance-product.dto';

@Injectable()
export class InsuranceProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInsuranceProductDto) {
    return this.prisma.insuranceProduct.create({
      data: {
        userId: dto.userId,
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

  async findAll() {
    return this.prisma.insuranceProduct.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.insuranceProduct.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`해당 보험 상품(ID: ${id})을 찾을 수 없습니다.`);
    }
    return product;
  }

  async update(id: number, dto: UpdateInsuranceProductDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.maturityDate) data.maturityDate = new Date(dto.maturityDate);

    return this.prisma.insuranceProduct.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.insuranceProduct.delete({
      where: { id },
    });
  }
}
