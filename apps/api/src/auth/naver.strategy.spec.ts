import { Test, TestingModule } from '@nestjs/testing';
import { NaverStrategy } from './naver.strategy';

describe('NaverStrategy', () => {
  let strategy: NaverStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NaverStrategy],
    }).compile();

    strategy = module.get<NaverStrategy>(NaverStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user object', async () => {
    const profile = {
      id: 'naver_123',
      email: 'naver@example.com',
      name: 'Naver User',
    };

    let resultUser;
    const done = (err, user) => {
      resultUser = user;
    };

    await strategy.validate('accessToken', 'refreshToken', profile, done);

    expect(resultUser).toEqual({
      email: 'naver@example.com',
      name: 'Naver User',
      provider: 'naver',
      providerId: 'naver_123',
    });
  });
});
