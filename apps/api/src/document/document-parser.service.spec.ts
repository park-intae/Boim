import { Test, TestingModule } from '@nestjs/testing';
import { DocumentParserService } from './document-parser.service';

describe('DocumentParserService', () => {
  let service: DocumentParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentParserService],
    }).compile();

    service = module.get<DocumentParserService>(DocumentParserService);
  });

  describe('parseInsuranceText (정규식/패턴 매칭)', () => {
    it('가상 모의 증권 텍스트에서 주요 계약 정보를 정확하게 추출해야 한다', () => {
      const sampleText = `
증권번호: POL-2024-8839210
보험회사: 한화손해보험 주식회사
상 품 명: 무배당 한화 라이프케어 건강종합보험
보 험 종: 건강보험 (HEALTH)
보험기간: 2024년 03월 01일 ~ 2044년 03월 01일
월 보험료: 85,000원 (매월 15일 자동이체)
보장금액: 50,000,000원
`;

      const result = service.parseInsuranceText(sampleText);

      expect(result.institution).toBe('한화손해보험');
      expect(result.name).toBe('무배당 한화 라이프케어 건강종합보험');
      expect(result.category).toBe('HEALTH');
      expect(result.monthlyPayment).toBe(85000);
      expect(result.paymentDay).toBe(15);
      expect(result.startDate).toBe('2024-03-01');
      expect(result.maturityDate).toBe('2044-03-01');
      expect(result.coverageAmount).toBe(50000000);
      expect(result.confidence).toBeGreaterThanOrEqual(0.95);
    });

    it('삼성화재 운전자보험 텍스트 패턴을 올바르게 감지해야 한다', () => {
      const driverText = `
보험회사: 삼성화재해상보험
상품명: 삼성화재 다이렉트 운전자보험
보험기간: 2025.01.10 ~ 2035.01.10
납입보험료: 25,000원 (매월 20일)
보장금액: 30,000,000원
`;

      const result = service.parseInsuranceText(driverText);

      expect(result.institution).toBe('삼성화재');
      expect(result.name).toBe('삼성화재 다이렉트 운전자보험');
      expect(result.category).toBe('AUTO');
      expect(result.monthlyPayment).toBe(25000);
      expect(result.paymentDay).toBe(20);
      expect(result.startDate).toBe('2025-01-10');
      expect(result.maturityDate).toBe('2035-01-10');
      expect(result.coverageAmount).toBe(30000000);
    });

    it('종신보험 및 사망 보장 패턴을 올바르게 감지해야 한다', () => {
      const lifeText = `
보험회사: 교보생명
상품명: 무배당 교보프라임 종신보험
보험기간: 2023-05-01 ~ 2073-05-01
월납입액: 150,000원 (매월 25일)
보장금액: 100,000,000원
`;

      const result = service.parseInsuranceText(lifeText);

      expect(result.institution).toBe('교보생명');
      expect(result.name).toBe('무배당 교보프라임 종신보험');
      expect(result.category).toBe('LIFE');
      expect(result.monthlyPayment).toBe(150000);
      expect(result.paymentDay).toBe(25);
      expect(result.startDate).toBe('2023-05-01');
      expect(result.maturityDate).toBe('2073-05-01');
      expect(result.coverageAmount).toBe(100000000);
    });
  });
});
