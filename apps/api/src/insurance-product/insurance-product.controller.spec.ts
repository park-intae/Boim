import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { InsuranceProductController } from './insurance-product.controller';
import { InsuranceProductService } from './insurance-product.service';
import type { RequestWithJwtUser } from '../auth/auth.controller';

describe('InsuranceProductController', () => {
  let controller: InsuranceProductController;
  let service: InsuranceProductService;

  const mockReq = {
    user: { userId: '1', email: 'test@boim.com' },
  } as RequestWithJwtUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsuranceProductController],
      providers: [
        {
          provide: InsuranceProductService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 1 }),
            findAll: jest.fn().mockResolvedValue([{ id: 1 }]),
            findOne: jest.fn().mockResolvedValue({ id: 1 }),
            update: jest.fn().mockResolvedValue({ id: 1 }),
            remove: jest.fn().mockResolvedValue({ id: 1 }),
          },
        },
      ],
    }).compile();

    controller = module.get<InsuranceProductController>(
      InsuranceProductController,
    );
    service = module.get<InsuranceProductService>(InsuranceProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw UnauthorizedException when user is missing on protected routes', () => {
    const emptyReq = {} as RequestWithJwtUser;
    expect(() => controller.findAll(emptyReq)).toThrow(UnauthorizedException);
    expect(() => controller.findOne(emptyReq, '1')).toThrow(
      UnauthorizedException,
    );
    expect(() => controller.create(emptyReq, {} as any)).toThrow(
      UnauthorizedException,
    );
    expect(() => controller.update(emptyReq, '1', {})).toThrow(
      UnauthorizedException,
    );
    expect(() => controller.remove(emptyReq, '1')).toThrow(
      UnauthorizedException,
    );
  });

  it('should call create method with authenticated userId', async () => {
    const dto = {
      userId: 999,
      category: '생명보험',
      name: '테스트 상품',
      institution: '삼성생명',
      startDate: '2023-01-01',
      maturityDate: '2033-01-01',
      monthlyPayment: 100000,
      coverageAmount: 100000000,
    };
    expect(await controller.create(mockReq, dto)).toEqual({ id: 1 });
    expect(service.create).toHaveBeenCalledWith(1n, dto);
  });

  it('should call findAll method with authenticated userId', async () => {
    expect(await controller.findAll(mockReq)).toEqual([{ id: 1 }]);
    expect(service.findAll).toHaveBeenCalledWith(1n);
  });

  it('should call findOne method with authenticated userId', async () => {
    expect(await controller.findOne(mockReq, '1')).toEqual({ id: 1 });
    expect(service.findOne).toHaveBeenCalledWith(1n, 1);
  });

  it('should call update method with authenticated userId', async () => {
    const dto = { category: '건강보험' };
    expect(await controller.update(mockReq, '1', dto)).toEqual({ id: 1 });
    expect(service.update).toHaveBeenCalledWith(1n, 1, dto);
  });

  it('should call remove method with authenticated userId', async () => {
    expect(await controller.remove(mockReq, '1')).toEqual({ id: 1 });
    expect(service.remove).toHaveBeenCalledWith(1n, 1);
  });
});
