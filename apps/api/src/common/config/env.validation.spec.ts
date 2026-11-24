import { getJwtSecret, validateRequiredEnv } from './env.validation';

describe('env.validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('개발/테스트 환경에서 JWT_SECRET 미설정 시 개발용 폴백 시크릿을 반환한다', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.JWT_SECRET;
    expect(getJwtSecret()).toBe('fallback_secret_for_dev_only');
  });

  it('프로덕션 환경에서 JWT_SECRET이 없거나 안전하지 않으면 예외를 던진다', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow();

    process.env.JWT_SECRET = 'fallback_secret_for_dev_only';
    expect(() => getJwtSecret()).toThrow();

    process.env.JWT_SECRET = 'short_key';
    expect(() => getJwtSecret()).toThrow();
  });

  it('프로덕션 환경에서 안전한 JWT_SECRET과 DATABASE_URL이 없으면 validateRequiredEnv가 실패한다', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'very_strong_production_jwt_secret_key_2026';
    delete process.env.DATABASE_URL;
    expect(() => validateRequiredEnv()).toThrow();

    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/boim';
    expect(() => validateRequiredEnv()).not.toThrow();
  });
});
