import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceProductService } from './insurance-product.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

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
              create: jest.fn().mockResolvedValue({ id: 1 }),
              findMany: jest.fn().mockResolvedValue([{ id: 1 }]),
              findUnique: jest.fn().mockResolvedValue({ id: 1 }),
              update: jest.fn().mockResolvedValue({ id: 1 }),
              delete: jest.fn().mockResolvedValue({ id: 1 }),
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

  it('should throw NotFoundException if product not found', async () => {
    jest.spyOn(prisma.insuranceProduct, 'findUnique').mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
