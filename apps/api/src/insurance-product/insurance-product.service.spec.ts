import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceProductService } from './insurance-product.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('InsuranceProductService', () => {
  let service: InsuranceProductService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsuranceProductService,
        {
          provide: PrismaService,
          useValue: {
            insuranceProduct: {
              create: jest.fn().mockResolvedValue({ id: 1, userId: 1n }),
              findMany: jest.fn().mockResolvedValue([{ id: 1, userId: 1n }]),
              findUnique: jest.fn().mockResolvedValue({ id: 1, userId: 1n }),
              update: jest.fn().mockResolvedValue({ id: 1, userId: 1n }),
              delete: jest.fn().mockResolvedValue({ id: 1, userId: 1n }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<InsuranceProductService>(InsuranceProductService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should filter findAll by authenticated userId', async () => {
    await service.findAll(1n);
    expect(prisma.insuranceProduct.findMany).toHaveBeenCalledWith({
      where: { userId: 1n },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should throw NotFoundException if product not found', async () => {
    jest.spyOn(prisma.insuranceProduct, 'findUnique').mockResolvedValue(null);
    await expect(service.findOne(1n, 999)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when accessing another user product', async () => {
    jest
      .spyOn(prisma.insuranceProduct, 'findUnique')
      .mockResolvedValue({ id: 1n, userId: 2n } as any);
    await expect(service.findOne(1n, 1)).rejects.toThrow(ForbiddenException);
    await expect(service.update(1n, 1, { name: '해킹' })).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.remove(1n, 1)).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException on invalid date or negative amount', async () => {
    await expect(
      service.create(1n, {
        userId: 1,
        category: '건강보험',
        name: '테스트',
        institution: '삼성화재',
        startDate: 'invalid-date',
        maturityDate: '2030-01-01',
        monthlyPayment: 50000,
        coverageAmount: 10000000,
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.create(1n, {
        userId: 1,
        category: '건강보험',
        name: '테스트',
        institution: '삼성화재',
        startDate: '2024-01-01',
        maturityDate: '2030-01-01',
        monthlyPayment: -100,
        coverageAmount: 10000000,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
