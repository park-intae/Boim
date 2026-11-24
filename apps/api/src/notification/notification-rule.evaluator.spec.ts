import { NotificationRuleEvaluator } from './notification-rule.evaluator';

describe('NotificationRuleEvaluator', () => {
  let evaluator: NotificationRuleEvaluator;

  beforeEach(() => {
    evaluator = new NotificationRuleEvaluator();
  });

  describe('checkPaymentDue', () => {
    it('returns D-7 candidate when payment date is exactly 7 days ahead', () => {
      // 2026-11-08 KST, 시작일이 2026-01-15인 경우 당월 납입일은 11월 15일 -> 7일 전
      const todayKst = new Date(Date.UTC(2026, 10, 8, 0, 0, 0, 0)); // 11월 8일
      const product = {
        id: 100n,
        userId: 1n,
        name: '종합건강보험',
        institution: '삼성화재',
        startDate: new Date('2026-01-15T00:00:00.000Z'),
        maturityDate: new Date('2036-01-15T00:00:00.000Z'),
        monthlyPayment: 85000,
      };

      const result = evaluator.checkPaymentDue(product, todayKst, 2026, 11);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('payment');
      expect(result?.title).toContain('7일 전');
      expect(result?.message).toContain('85,000원');
    });

    it('returns D-1 candidate when payment date is tomorrow', () => {
      // 2026-11-14 KST, 납입일이 15일인 경우 1일 전
      const todayKst = new Date(Date.UTC(2026, 10, 14, 0, 0, 0, 0)); // 11월 14일
      const product = {
        id: 100n,
        userId: 1n,
        name: '종합건강보험',
        institution: '삼성화재',
        startDate: new Date('2026-01-15T00:00:00.000Z'),
        maturityDate: new Date('2036-01-15T00:00:00.000Z'),
        monthlyPayment: 85000,
      };

      const result = evaluator.checkPaymentDue(product, todayKst, 2026, 11);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('payment');
      expect(result?.title).toContain('1일 전');
    });

    it('returns null if outside active contract dates', () => {
      const todayKst = new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 0));
      const product = {
        id: 100n,
        userId: 1n,
        name: '미래계약보험',
        institution: '삼성화재',
        startDate: new Date('2026-01-15T00:00:00.000Z'),
        maturityDate: new Date('2036-01-15T00:00:00.000Z'),
        monthlyPayment: 85000,
      };

      const result = evaluator.checkPaymentDue(product, todayKst, 2025, 1);
      expect(result).toBeNull();
    });
  });

  describe('checkMaturity', () => {
    it('returns D-30 maturity candidate', () => {
      const todayKst = new Date(Date.UTC(2026, 9, 1, 0, 0, 0, 0)); // 2026-10-01
      const maturityDate = new Date(Date.UTC(2026, 9, 31, 0, 0, 0, 0)); // 2026-10-31 (30일 차이)
      const product = {
        id: 200n,
        userId: 1n,
        name: '단기운전자보험',
        institution: 'DB손해보험',
        maturityDate,
      };

      const result = evaluator.checkMaturity(product, todayKst);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('maturity');
      expect(result?.title).toContain('30일 전');
    });

    it('returns D-7 maturity candidate', () => {
      const todayKst = new Date(Date.UTC(2026, 9, 24, 0, 0, 0, 0)); // 2026-10-24
      const maturityDate = new Date(Date.UTC(2026, 9, 31, 0, 0, 0, 0)); // 7일 후
      const product = {
        id: 200n,
        userId: 1n,
        name: '단기운전자보험',
        institution: 'DB손해보험',
        maturityDate,
      };

      const result = evaluator.checkMaturity(product, todayKst);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('maturity');
      expect(result?.title).toContain('7일 전');
    });

    it('returns D-Day maturity candidate', () => {
      const todayKst = new Date(Date.UTC(2026, 9, 31, 0, 0, 0, 0));
      const maturityDate = new Date(Date.UTC(2026, 9, 31, 0, 0, 0, 0));
      const product = {
        id: 200n,
        userId: 1n,
        name: '단기운전자보험',
        institution: 'DB손해보험',
        maturityDate,
      };

      const result = evaluator.checkMaturity(product, todayKst);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('maturity');
      expect(result?.title).toContain('오늘 만기일');
    });
  });

  describe('determineChannel & isQuietTime', () => {
    it('returns in_app if during quiet hours', () => {
      const settings = {
        pushEnabled: true,
        emailEnabled: true,
        kakaoEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      };
      // 23:00 KST
      const nightDate = new Date('2026-11-11T14:00:00.000Z'); // UTC 14:00 = KST 23:00

      const channel = evaluator.determineChannel(settings, nightDate);
      expect(channel).toBe('in_app');
    });

    it('returns kakao first when outside quiet hours and kakao enabled', () => {
      const settings = {
        pushEnabled: true,
        emailEnabled: true,
        kakaoEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      };
      // 14:00 KST (UTC 05:00)
      const dayDate = new Date('2026-11-11T05:00:00.000Z');

      const channel = evaluator.determineChannel(settings, dayDate);
      expect(channel).toBe('kakao');
    });

    it('falls back to push then email then in_app', () => {
      const dayDate = new Date('2026-11-11T05:00:00.000Z');

      expect(
        evaluator.determineChannel(
          {
            pushEnabled: true,
            emailEnabled: true,
            kakaoEnabled: false,
            quietHoursStart: null,
            quietHoursEnd: null,
          },
          dayDate,
        ),
      ).toBe('push');

      expect(
        evaluator.determineChannel(
          {
            pushEnabled: false,
            emailEnabled: true,
            kakaoEnabled: false,
            quietHoursStart: null,
            quietHoursEnd: null,
          },
          dayDate,
        ),
      ).toBe('email');

      expect(
        evaluator.determineChannel(
          {
            pushEnabled: false,
            emailEnabled: false,
            kakaoEnabled: false,
            quietHoursStart: null,
            quietHoursEnd: null,
          },
          dayDate,
        ),
      ).toBe('in_app');
    });

    it('handles leap-year Feb 29, non-leap Feb 28 month-end clamping, and Dec->Jan rollover', () => {
      // 31일 가입 상품의 2024년(윤년) 2월 말일(29일) 기준 D-1 = 2월 28일
      const leapProduct = {
        id: 1n,
        userId: 1n,
        name: '윤년상품',
        institution: '삼성',
        startDate: new Date('2024-01-31T00:00:00Z'),
        maturityDate: new Date('2030-01-31T00:00:00Z'),
        monthlyPayment: 50000,
      };
      const feb28Leap = new Date(Date.UTC(2024, 1, 28, 0, 0, 0, 0));
      const leapResult = evaluator.checkPaymentDue(
        leapProduct,
        feb28Leap,
        2024,
        2,
      );
      expect(leapResult?.title).toContain('1일 전');
      expect(leapResult?.message).toContain('2월 29일');

      // 2025년(평년) 2월 말일(28일) 기준 D-1 = 2월 27일
      const feb27NonLeap = new Date(Date.UTC(2025, 1, 27, 0, 0, 0, 0));
      const nonLeapResult = evaluator.checkPaymentDue(
        leapProduct,
        feb27NonLeap,
        2025,
        2,
      );
      expect(nonLeapResult?.title).toContain('1일 전');
      expect(nonLeapResult?.message).toContain('2월 28일');

      // 12월 말 -> 익년 1월 1일 납입 D-7 (2026-12-25 -> 2027-01-01)
      const jan1Product = {
        ...leapProduct,
        startDate: new Date('2024-01-01T00:00:00Z'),
      };
      const dec25 = new Date(Date.UTC(2026, 11, 25, 0, 0, 0, 0));
      const rollover = evaluator.checkPaymentDue(jan1Product, dec25, 2026, 12);
      expect(rollover?.title).toContain('7일 전');
      expect(rollover?.message).toContain('1월 1일');
    });

    it('checks exact quiet hours boundaries (21:59, 22:00, 08:00, 08:01 KST) and daytime quiet hours', () => {
      // KST = UTC + 9h
      expect(
        evaluator.isQuietTime(
          '22:00',
          '08:00',
          new Date('2026-11-11T12:59:00.000Z'), // KST 21:59
        ),
      ).toBe(false);
      expect(
        evaluator.isQuietTime(
          '22:00',
          '08:00',
          new Date('2026-11-11T13:00:00.000Z'), // KST 22:00
        ),
      ).toBe(true);
      expect(
        evaluator.isQuietTime(
          '22:00',
          '08:00',
          new Date('2026-11-11T23:00:00.000Z'), // KST 08:00
        ),
      ).toBe(true);
      expect(
        evaluator.isQuietTime(
          '22:00',
          '08:00',
          new Date('2026-11-11T23:01:00.000Z'), // KST 08:01
        ),
      ).toBe(false);
      expect(
        evaluator.isQuietTime(
          '13:00',
          '15:00',
          new Date('2026-11-11T05:00:00.000Z'), // KST 14:00
        ),
      ).toBe(true);
    });
  });
});
