import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PassService } from './pass.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PassService', () => {
  let service: PassService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest.fn().mockResolvedValue({ id: BigInt(1), isPassVerified: true }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PassService>(PassService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestMockVerification', () => {
    it('should generate a transactionId and log auth code', async () => {
      const transactionId =
        await service.requestMockVerification('01012345678');
      expect(transactionId).toContain('MOCK_TX_');
    });
  });

  describe('verifyMockCode', () => {
    it('should return success message for bypass code 000000 and update user', async () => {
      const result = await service.verifyMockCode('tx_123', '000000', '1');
      expect(result).toEqual({ message: 'PASS 본인인증이 완료되었습니다.' });
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: BigInt(1) },
          data: expect.objectContaining({ isPassVerified: true }),
        }),
      );
    });

    it('should return success message for code 123456 without userId', async () => {
      const result = await service.verifyMockCode('tx_123', '123456');
      expect(result).toEqual({ message: 'PASS 본인인증이 완료되었습니다.' });
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid code', async () => {
      await expect(service.verifyMockCode('tx_123', '999999')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
