const INSECURE_DEV_JWT_SECRETS = new Set([
  'fallback_secret_for_dev_only',
  'boim_oauth_state_secret_key',
  'boim_jwt_secret_key_production_2026',
]);

/**
 * 환경변수에서 JWT 시크릿을 안전하게 조회합니다.
 * 프로덕션 환경에서는 미설정 또는 알려진 기본값 사용 시 즉시 예외를 발생시킵니다.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    if (!secret || INSECURE_DEV_JWT_SECRETS.has(secret) || secret.length < 16) {
      throw new Error(
        '[Security] 프로덕션 환경에서는 16자 이상의 안전한 JWT_SECRET 환경변수가 필수입니다.',
      );
    }
    return secret;
  }

  return secret || 'fallback_secret_for_dev_only';
}

/**
 * 서버 부트스트랩 시 필수 환경변수를 검증합니다.
 */
export function validateRequiredEnv(): void {
  getJwtSecret();

  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.DATABASE_URL?.trim()
  ) {
    throw new Error('[Config] DATABASE_URL 환경변수가 설정되지 않았습니다.');
  }
}
