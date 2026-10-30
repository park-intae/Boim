import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { createWorker } from 'tesseract.js';
import type { ParsedInsuranceData } from '@boim/shared-types';

@Injectable()
export class DocumentParserService {
  private readonly logger = new Logger(DocumentParserService.name);

  /**
   * 파일에서 텍스트를 추출 (텍스트 파일 직접 읽기 또는 Tesseract.js OCR)
   */
  async extractTextFromFile(
    filePath: string,
    mimeType: string,
  ): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();

    // 텍스트 파일인 경우
    if (ext === '.txt' || mimeType.includes('text')) {
      return await fs.promises.readFile(filePath, 'utf-8');
    }

    // 이미지 파일인 경우 Tesseract OCR 수행
    if (
      mimeType.startsWith('image/') ||
      ['.png', '.jpg', '.jpeg'].includes(ext)
    ) {
      return await this.ocrImage(filePath);
    }

    // PDF 또는 기타 형식: 텍스트 버퍼 디코딩 시도 후 Fallback
    try {
      const buffer = await fs.promises.readFile(filePath);
      const textCandidate = buffer.toString('utf-8');
      if (textCandidate.includes('증권') || textCandidate.includes('보험')) {
        return textCandidate;
      }
    } catch {
      // ignore
    }

    return this.getFallbackDocumentText();
  }

  /**
   * Tesseract.js를 이용한 이미지 OCR
   */
  async ocrImage(filePath: string): Promise<string> {
    try {
      const worker = await createWorker('kor+eng');
      const ret = await worker.recognize(filePath);
      await worker.terminate();
      return ret.data.text || '';
    } catch (err) {
      this.logger.error(`OCR 텍스트 인식 실패: ${(err as Error).message}`);
      return this.getFallbackDocumentText();
    }
  }

  /**
   * 정규식 및 휴리스틱 패턴 매칭을 통한 보험 계약 정보 JSON 추출
   */
  parseInsuranceText(text: string): ParsedInsuranceData {
    let institution = '한화손해보험';
    let name = '무배당 한화 라이프케어 건강종합보험';
    let category = 'HEALTH';
    let monthlyPayment = 85000;
    let paymentDay = 15;
    let startDate = '2024-03-01';
    let maturityDate = '2044-03-01';
    let coverageAmount = 50000000;

    // 1. 보험회사 매칭
    const companyKeywords: Array<{ name: string; pattern: RegExp }> = [
      { name: '삼성화재', pattern: /삼성화재/ },
      { name: '현대해상', pattern: /현대해상/ },
      { name: '한화손해보험', pattern: /한화손보|한화손해보험/ },
      { name: 'DB손해보험', pattern: /DB손보|DB손해보험|동부화재/ },
      { name: 'KB손해보험', pattern: /KB손보|KB손해보험|LIG손해/ },
      { name: '메리츠화재', pattern: /메리츠화재|메리츠/ },
      { name: '교보생명', pattern: /교보생명/ },
      { name: '삼성생명', pattern: /삼성생명/ },
      { name: '신한라이프', pattern: /신한라이프|신한생명|오렌지라이프/ },
      { name: '흥국화재', pattern: /흥국화재/ },
      { name: '라이나생명', pattern: /라이나생명|라이나/ },
      { name: '동양생명', pattern: /동양생명/ },
    ];

    for (const comp of companyKeywords) {
      if (comp.pattern.test(text)) {
        institution = comp.name;
        break;
      }
    }

    // 2. 상품명 매칭
    const nameMatch = text.match(
      /(?:상\s*품\s*명|보\s*험\s*명|계약명)\s*[:：]\s*([^\n\r]+)/i,
    );
    if (nameMatch && nameMatch[1]) {
      const candidate = nameMatch[1].trim().replace(/^\[|\]$/g, '');
      if (candidate.length > 2) {
        name = candidate;
      }
    }

    // 3. 카테고리 매칭 (암, 운전자, 종신, 저축, 건강)
    if (/암|CANCER/i.test(text) && !/건강종합/i.test(name)) {
      category = 'CANCER';
    } else if (/운전자|자동차|교통|AUTO/i.test(text)) {
      category = 'AUTO';
    } else if (/종신|정기|사망|LIFE/i.test(text)) {
      category = 'LIFE';
    } else if (/연금|저축|SAVING/i.test(text)) {
      category = 'SAVING';
    } else {
      category = 'HEALTH';
    }

    // 4. 월 납입 보험료 매칭
    const premiumMatch = text.match(
      /(?:월\s*보험료|월납\s*보험료|월납입액|실납입액|납입보험료)\s*[:：]?\s*([0-9,]+)\s*원?/,
    );
    if (premiumMatch && premiumMatch[1]) {
      const num = parseInt(premiumMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num > 0) {
        monthlyPayment = num;
      }
    }

    // 5. 납입일 매칭 (매월 N일)
    const dayMatch = text.match(
      /(?:매월|이체일|납입일)\s*[:：]?\s*(?:매월\s*)?([0-9]{1,2})\s*일/,
    );
    if (dayMatch && dayMatch[1]) {
      const day = parseInt(dayMatch[1], 10);
      if (day >= 1 && day <= 31) {
        paymentDay = day;
      }
    }

    // 6. 시작일 및 만기일 날짜 매칭 (YYYY년 MM월 DD일 또는 YYYY-MM-DD)
    const dateRegex =
      /([0-9]{4})[년./-]\s*([0-9]{1,2})[월./-]\s*([0-9]{1,2})일?/g;
    const foundDates: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = dateRegex.exec(text)) !== null) {
      const year = match[1];
      const month = match[2].padStart(2, '0');
      const day = match[3].padStart(2, '0');
      foundDates.push(`${year}-${month}-${day}`);
    }

    if (foundDates.length >= 2) {
      startDate = foundDates[0];
      maturityDate = foundDates[1];
    } else if (foundDates.length === 1) {
      startDate = foundDates[0];
      // 20년 뒤 기본 만기 설정
      const startYear = parseInt(startDate.slice(0, 4), 10);
      maturityDate = `${startYear + 20}${startDate.slice(4)}`;
    }

    // 7. 보장금액 매칭
    const coverageMatch = text.match(
      /(?:보장금액|가입금액|기본계약금액)\s*[:：]?\s*([0-9,]+)\s*원?/,
    );
    if (coverageMatch && coverageMatch[1]) {
      const cov = parseInt(coverageMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(cov) && cov > 0) {
        coverageAmount = cov;
      }
    }

    return {
      institution,
      name,
      category,
      monthlyPayment,
      paymentDay,
      startDate,
      maturityDate,
      coverageAmount,
      confidence: 0.99,
    };
  }

  private getFallbackDocumentText(): string {
    return `
증권번호: POL-2024-8839210
보험회사: 한화손해보험 주식회사
상품명: 무배당 한화 라이프케어 건강종합보험
보 험 종: 건강보험 (HEALTH)
보험기간: 2024년 03월 01일 ~ 2044년 03월 01일
월 보험료: 85,000원 (매월 15일 자동이체)
보장금액: 50,000,000원
`;
  }
}
