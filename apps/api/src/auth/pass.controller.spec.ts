import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PassController } from './pass.controller';
import { PassService } from './pass.service';
import { AuthService } from './auth.service';

describe('PassController', () => {
  let controller: PassController;
  let service: PassService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassController],
      providers: [
        {
          provide: PassService,
          useValue: {
            requestMockVerification: jest.fn().mockResolvedValue('MOCK_TX_123'),
            verifyMockCode: jest.fn().mockImplementation((_tx, code) => {
              if (code === '000000') {
                return Promise.resolve({
                  message: 'PASS 본인인증이 완료되었습니다.',
                });
              }
              return Promise.reject(
                new BadRequestException('인증번호가 일치하지 않습니다.'),
              );
            }),
          },
        },
        {
          provide: AuthService,
          useValue: {
            verifyToken: jest
              .fn()
              .mockReturnValue({ sub: '1', email: 'test@test.com' }),
          },
        },
      ],
    }).compile();

    controller = module.get<PassController>(PassController);
    service = module.get<PassService>(PassService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('requestVerification', () => {
    it('should return transactionId', async () => {
      const result = await controller.requestVerification('01012345678');
      expect(result).toEqual({ transactionId: 'MOCK_TX_123' });
      expect(service.requestMockVerification).toHaveBeenCalledWith(
        '01012345678',
      );
    });

    it('should throw BadRequestException if phone number is missing', async () => {
      await expect(controller.requestVerification('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyCode', () => {
    it('should return success message if code is valid', async () => {
      const mockReq = {
        headers: { authorization: 'Bearer mock_token' },
      } as any;

      const result = await controller.verifyCode(
        mockReq,
        'MOCK_TX_123',
        '000000',
      );
      expect(result).toEqual({ message: 'PASS 본인인증이 완료되었습니다.' });
      expect(authService.verifyToken).toHaveBeenCalledWith('mock_token');
      expect(service.verifyMockCode).toHaveBeenCalledWith(
        'MOCK_TX_123',
        '000000',
        '1',
      );
    });

    it('should throw BadRequestException if code is invalid', async () => {
      const mockReq = { headers: {} } as any;
      await expect(
        controller.verifyCode(mockReq, 'MOCK_TX_123', '111111'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
