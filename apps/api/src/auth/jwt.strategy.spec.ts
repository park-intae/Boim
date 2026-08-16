import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user payload', async () => {
    const payload = { sub: 'user_123', email: 'test@example.com' };
    const result = await strategy.validate(payload);

    expect(result).toEqual({ userId: 'user_123', email: 'test@example.com' });
  });

  it('should throw UnauthorizedException if sub is missing', async () => {
    const payload = { email: 'test@example.com' };
    
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
