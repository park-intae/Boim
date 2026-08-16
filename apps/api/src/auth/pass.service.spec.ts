import { Test, TestingModule } from '@nestjs/testing';
import { PassService } from './pass.service';

describe('PassService', () => {
  let service: PassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassService],
    }).compile();

    service = module.get<PassService>(PassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestMockVerification', () => {
    it('should generate a transactionId and log auth code', async () => {
      const transactionId = await service.requestMockVerification('01012345678');
      expect(transactionId).toContain('MOCK_TX_');
    });
  });

  describe('verifyMockCode', () => {
    it('should return true for bypass code 000000', async () => {
      const isValid = await service.verifyMockCode('tx_123', '000000');
      expect(isValid).toBe(true);
    });

    it('should return true for hardcoded code 123456', async () => {
      const isValid = await service.verifyMockCode('tx_123', '123456');
      expect(isValid).toBe(true);
    });

    it('should return false for invalid code', async () => {
      const isValid = await service.verifyMockCode('tx_123', '999999');
      expect(isValid).toBe(false);
    });
  });
});
