import { Test, TestingModule } from '@nestjs/testing';
import { KakaoStrategy } from './kakao.strategy';

describe('KakaoStrategy', () => {
  let strategy: KakaoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KakaoStrategy],
    }).compile();

    strategy = module.get<KakaoStrategy>(KakaoStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user object', async () => {
    const profile = {
      id: 'kakao_123',
      _json: {
        kakao_account: { email: 'kakao@example.com' },
        properties: { nickname: 'Kakao User' },
      },
    };

    let resultUser;
    const done = (err, user) => {
      resultUser = user;
    };

    await strategy.validate('accessToken', 'refreshToken', profile, done);

    expect(resultUser).toEqual({
      email: 'kakao@example.com',
      name: 'Kakao User',
      provider: 'kakao',
      providerId: 'kakao_123',
    });
  });
});
