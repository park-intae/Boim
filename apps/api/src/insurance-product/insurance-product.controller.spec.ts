import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceProductController } from './insurance-product.controller';
import { InsuranceProductService } from './insurance-product.service';

describe('InsuranceProductController', () => {
  let controller: InsuranceProductController;
  let service: InsuranceProductService;

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

    controller = module.get<InsuranceProductController>(InsuranceProductController);
    service = module.get<InsuranceProductService>(InsuranceProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create method', async () => {
    const dto = { userId: 1, category: '생명보험', name: '테스트 상품', institution: '삼성생명', startDate: '2023-01-01', maturityDate: '2033-01-01', monthlyPayment: 100000, coverageAmount: 100000000 };
    expect(await controller.create(dto)).toEqual({ id: 1 });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call findAll method', async () => {
    expect(await controller.findAll()).toEqual([{ id: 1 }]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call findOne method', async () => {
    expect(await controller.findOne('1')).toEqual({ id: 1 });
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should call update method', async () => {
    const dto = { category: '건강보험' };
    expect(await controller.update('1', dto)).toEqual({ id: 1 });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should call remove method', async () => {
    expect(await controller.remove('1')).toEqual({ id: 1 });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
