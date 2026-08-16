import { Test, TestingModule } from '@nestjs/testing';
import { PassController } from './pass.controller';
import { PassService } from './pass.service';

describe('PassController', () => {
  let controller: PassController;
  let service: PassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassController],
      providers: [
        {
          provide: PassService,
          useValue: {
            requestMockVerification: jest.fn().mockResolvedValue('MOCK_TX_123'),
            verifyMockCode: jest.fn().mockImplementation((tx, code) => code === '000000'),
          },
        },
      ],
    }).compile();

    controller = module.get<PassController>(PassController);
    service = module.get<PassService>(PassService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('requestVerification', () => {
    it('should return success and transactionId', async () => {
      const result = await controller.requestVerification('01012345678');
      expect(result).toEqual({ success: true, data: { transactionId: 'MOCK_TX_123' } });
      expect(service.requestMockVerification).toHaveBeenCalledWith('01012345678');
    });

    it('should return failure if phone number is missing', async () => {
      const result = await controller.requestVerification('');
      expect(result).toEqual({ success: false, message: '전화번호를 입력해주세요.' });
    });
  });

  describe('verifyCode', () => {
    it('should return success if code is valid', async () => {
      const result = await controller.verifyCode('MOCK_TX_123', '000000');
      expect(result).toEqual({ success: true, message: 'PASS 본인인증이 완료되었습니다.' });
    });

    it('should return failure if code is invalid', async () => {
      const result = await controller.verifyCode('MOCK_TX_123', '111111');
      expect(result).toEqual({ success: false, message: '인증번호가 일치하지 않습니다.' });
    });
  });
});
