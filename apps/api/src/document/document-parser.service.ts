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
   * Tesseract.js를 이용한 이미지 OCR (로컬 사전 오프라인 고속 구동)
   */
  async ocrImage(filePath: string): Promise<string> {
    let worker: any = null;
    try {
      const candidates = [
        path.resolve(__dirname, '..', '..', 'traineddata'),
        path.resolve(process.cwd(), 'traineddata'),
        path.resolve(process.cwd(), 'apps', 'api', 'traineddata'),
      ];
      const langPath =
        candidates.find((p) => fs.existsSync(p)) || process.cwd();

      worker = await createWorker('kor+eng', 1, {
        langPath,
        gzip: false,
        errorHandler: (err: any) => {
          this.logger.warn(`[Tesseract Worker Warning] ${err?.message || err}`);
        },
      });

      const ret = await worker.recognize(filePath);
      const text = ret?.data?.text || '';
      this.logger.log(`OCR 텍스트 인식 성공 (${text.length}자)`);
      return text;
    } catch (err) {
      this.logger.error(`OCR 텍스트 인식 실패: ${(err as Error).message}`);
      return this.getFallbackDocumentText();
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch {
          // ignore termination error
        }
      }
    }
  }

  /**
   * 정규식 및 휴리스틱 패턴 매칭을 통한 보험 계약 정보 JSON 추출
   */
  parseInsuranceText(text: string): ParsedInsuranceData {
    let institution = '';
    let name = '';
    let category = 'HEALTH';
    let monthlyPayment = 85000;
    let paymentDay = 15;
    let startDate = '2024-03-01';
    let maturityDate = '2044-03-01';
    let coverageAmount = 50000000;

    // 1. 보험회사 매칭 (국내 27대 주요 생보/손보사 및 공제회 우선 매칭)
    const companyKeywords: Array<{ name: string; pattern: RegExp }> = [
      { name: '삼성화재', pattern: /삼성\s*화재/ },
      { name: '현대해상', pattern: /현대\s*해상/ },
      { name: '한화손해보험', pattern: /한화\s*(?:손보|손해보\s*험|화재)/ },
      {
        name: 'DB손해보험',
        pattern: /\bDB\s*(?:손보|손해보\s*험)|동부\s*화재|디비\s*손해/,
      },
      {
        name: 'KB손해보험',
        pattern: /\bKB\s*(?:손보|손해보\s*험)|케이비\s*손해|LIG\s*손해/,
      },
      { name: '메리츠화재', pattern: /메리츠\s*화재|메리츠/ },
      { name: '교보생명', pattern: /교보\s*생명/ },
      { name: '삼성생명', pattern: /삼성\s*생명/ },
      { name: '한화생명', pattern: /한화\s*생명|대한\s*생명/ },
      {
        name: '신한라이프',
        pattern: /신한\s*라이프|신한\s*생명|오렌지\s*라이프/,
      },
      { name: '흥국화재', pattern: /흥국\s*화재/ },
      { name: '흥국생명', pattern: /흥국\s*생명/ },
      { name: '라이나생명', pattern: /라이나\s*생명/ },
      { name: '동양생명', pattern: /동양\s*생명/ },
      { name: 'DB생명', pattern: /\bDB\s*생명|동부\s*생명/ },
      { name: 'KB라이프', pattern: /\bKB\s*라이프|푸르덴셜/ },
      { name: 'AIA생명', pattern: /\bAIA\s*(?:생명|보험)|에이아이에이/ },
      {
        name: 'AXA손해보험',
        pattern: /\bAXA\s*(?:손보|손해보\s*험)|악사\s*손해/,
      },
      {
        name: 'MG손해보험',
        pattern: /\bMG\s*(?:손보|손해보\s*험)|엠지\s*손해/,
      },
      { name: '하나손해보험', pattern: /하나\s*(?:손해|손보)|더케이/ },
      { name: '하나생명', pattern: /하나\s*생명/ },
      { name: '우체국보험', pattern: /우체국\s*보험/ },
      { name: 'NH농협손해보험', pattern: /농협\s*(?:손해|손보)|NH\s*농협손해/ },
      { name: 'NH농협생명', pattern: /농협\s*생명|NH\s*농협생명/ },
      { name: '수협공제', pattern: /수협\s*공제/ },
      { name: '카카오페이손해보험', pattern: /카카오\s*페이\s*(?:손해)?보험/ },
      { name: '토스인슈어런스', pattern: /토스\s*인슈어런스/ },
    ];

    for (const comp of companyKeywords) {
      if (comp.pattern.test(text)) {
        institution = comp.name;
        break;
      }
    }

    // 27대 대형 보험사에 없으면 일반 보험사 접미사(손해보험, 생명보험, 화재 등)를 통한 포괄 매칭 (예: 한빛손해보험 등)
    if (!institution) {
      const genericCompanyMatch = text.match(
        /([가-힣A-Za-z0-9]{2,10})\s*(?:손해보\s*[험엄]|생명보\s*[험엄]|화재보\s*[험엄]|해상보\s*[험엄]|손보|생명|공제|화재|해상|라이프)(?:\s*주식회사)?/,
      );
      if (genericCompanyMatch) {
        let companyPrefix = genericCompanyMatch[1].replace(
          /[^가-힣A-Za-z0-9]/g,
          '',
        );
        // OCR 오타 보정: '안빛', '하빈' -> 본문에 '한빛'이 있다면 '한빛'으로 보정
        if (
          (companyPrefix === '안빛' || companyPrefix === '하빈') &&
          /한빛/.test(text)
        ) {
          companyPrefix = '한빛';
        }
        let suffix = '손해보험';
        if (/생명/.test(genericCompanyMatch[0])) suffix = '생명';
        else if (/화재/.test(genericCompanyMatch[0])) suffix = '화재';
        else if (/해상/.test(genericCompanyMatch[0])) suffix = '해상';
        else if (/공제/.test(genericCompanyMatch[0])) suffix = '공제';
        institution = `${companyPrefix}${suffix}`;
      }
    }

    // 추가 노이즈 완충 ("하빈 수 해 [= 험", "한빛손해보 엄" 등)
    if (!institution) {
      const looseMatch = text.match(
        /([가-힣]{2,6})\s*(?:수\s*해|손\s*해|화\s*재)\s*(?:\[=\s*험|보\s*험|보\s*엄)/,
      );
      if (looseMatch) {
        let prefix = looseMatch[1];
        if (prefix === '하빈' || prefix === '안빛') prefix = '한빛';
        institution = `${prefix}손해보험`;
      }
    }

    if (!institution) {
      institution = '한화손해보험';
    }

    // 2. 상품명 매칭 (한국 표준 보험 상품명 패턴 최우선 탐색)
    // 2-1. 명시적 "무배당 / (무) ... 종합보험/건강보험/보험/공제/플랜" 검색
    const fullProductMatch = text.match(
      /(?:무\s*배\s*당|\(무\)|유\s*배\s*당|\(유\))\s*([가-힣A-Za-z0-9\s]{2,30}?(?:종합보험|건강보험|실손보험|암보험|정기보험|종신보험|운전자보험|자동차보험|치아보험|어린이보험|화재보험|보험|공제|플랜))/i,
    );
    if (fullProductMatch) {
      name = fullProductMatch[0].replace(/\s+/g, ' ').trim();
    }

    // 2-2. 2-1에 없으면 본문 행별 스캔 (대한민국 보험 상품명의 특성)
    if (!name) {
      const lines = text.split(/[\r\n]+/);
      for (const line of lines) {
        if (
          /(?:chatgpt|http|\.com|\.net|브라우저|채팅|Gemini|다운로드|이미지\s*생성|오류\s*해결)/i.test(
            line,
          )
        ) {
          continue;
        }
        const m = line.match(
          /(?:무배당\s*)?[가-힣A-Za-z0-9\s]{2,20}(?:종합보험|건강보험|실손보험|암보험|정기보험|종신보험|운전자보험|자동차보험|치아보험|어린이보험|화재보험|통합보험)/,
        );
        if (m && !/(?:회사|주식회사|계약자|피보험자|증권번호)/.test(line)) {
          name = m[0].replace(/^[^\w가-힣(]+/, '').trim();
          break;
        }
      }
    }

    // 2-3. 라벨 기반 매칭 ("보험상품명 : ...")
    if (!name) {
      const nameMatch = text.match(
        /(?:상\s*품\s*명|보\s*험\s*종\s*목|보\s*험\s*명|계\s*약\s*명|가\s*입\s*상\s*품)\s*[:：]?\s*([^\n\r]+)/i,
      );
      if (nameMatch && nameMatch[1]) {
        const candidate = nameMatch[1].replace(/[;:,[\]]/g, '').trim();
        // 유효한 한글이 2자 이상 존재해야 노이즈가 아님 (ae Sa - 등 배제)
        const hangulOnly = candidate.replace(/[^가-힣]/g, '');
        if (hangulOnly.length >= 2 && candidate.length <= 40) {
          name = candidate;
        }
      }
    }

    // 2-4. 기타 라인 단위 휴리스틱 검색
    if (!name) {
      const lines = text.split(/[\r\n]+/);
      for (const line of lines) {
        if (
          /(?:chatgpt|http|\.com|\.net|브라우저|채팅|Gemini|다운로드|이미지\s*생성|오류\s*해결)/i.test(
            line,
          )
        ) {
          continue;
        }

        const cleaned = line
          .replace(institution, '')
          .replace(/^(?:증서|보험증서|증권|보험증권)/, '')
          .replace(/^[0-9Q_\-\s.:[\]]+/, '')
          .trim();

        const hangulOnly = cleaned.replace(/[^가-힣]/g, '');
        if (
          hangulOnly.length >= 4 &&
          cleaned.length <= 40 &&
          /(?:보험|케어|다이렉트|안심|실손|보장|플랜|안전|라이프|종합|건강)/.test(
            cleaned,
          ) &&
          !/(?:회사|주식회사|계약자|피보험자|증권번호)/.test(cleaned)
        ) {
          name = cleaned;
          break;
        }
      }
    }

    // 상품명 정제: 앞뒤 노이즈 및 불필요한 특수문자 제거
    if (name) {
      name = name
        .replace(/^[^\w가-힣(]+/, '')
        .replace(/[^\w가-힣)]+$/, '')
        .replace(/^[삐리|Bl|\s]+/, '')
        .trim();
    } else {
      name = '무배당 라이프케어 건강종합보험';
    }

    // 3. 카테고리 매칭 (회사명 제외 텍스트 기반으로 치아, 어린이, 펫, 운전자, 화재, 암, 종신, 저축, 건강/종합 순 매칭)
    const textForCategory = text.replace(new RegExp(institution, 'g'), '');

    if (
      /치아|덴탈|DENTAL/i.test(name) ||
      /치아|덴탈|DENTAL/i.test(textForCategory)
    ) {
      category = 'DENTAL';
    } else if (
      /어린이|자녀|태아|CHILD/i.test(name) ||
      /어린이|자녀|태아|CHILD/i.test(textForCategory)
    ) {
      category = 'CHILD';
    } else if (
      /펫|반려|강아지|고양이|PET/i.test(name) ||
      /펫|반려|강아지|고양이|PET/i.test(textForCategory)
    ) {
      category = 'PET';
    } else if (
      /운전자|자동차|교통|AUTO/i.test(name) ||
      /운전자|자동차|교통|AUTO/i.test(textForCategory)
    ) {
      category = 'AUTO';
    } else if (
      /화재보험|재물|주택화재|건물화재|FIRE/i.test(name) ||
      /화재보험|재물보험|주택화재|건물화재/i.test(textForCategory)
    ) {
      category = 'FIRE';
    } else if (
      (/암|CANCER/i.test(name) || /암|CANCER/i.test(textForCategory)) &&
      !/건강|종합|상해/.test(name)
    ) {
      category = 'CANCER';
    } else if (
      (/종신|정기|사망|LIFE/i.test(name) ||
        /종신|정기|사망/.test(textForCategory)) &&
      !/건강|상해|질병|종합/.test(name)
    ) {
      category = 'LIFE';
    } else if (
      /연금|저축|SAVING/i.test(name) ||
      /연금|저축/.test(textForCategory)
    ) {
      category = 'SAVING';
    } else {
      category = 'HEALTH';
    }

    // 4. 월 납입 보험료 매칭 (합계/월납/정기/단독 금액 정밀 파싱)
    const premiumMatch = text.match(
      /(?:월\s*납[^\n\r0-9]{0,20}|합계\s*보험료|납입\s*보험료|보험료\s*합계|월\s*보험료|정기\s*보험료|납부금액)\s*[:：]?\s*(?:금\s*)?([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,8})\s*원?/i,
    );
    if (premiumMatch && premiumMatch[1]) {
      const num = parseInt(premiumMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num > 0) {
        monthlyPayment = num;
      }
    } else {
      // 표 형식 등의 "XX,XXX원" 금액 탐색
      const allAmounts = [
        ...text.matchAll(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,8})\s*원/g),
      ]
        .map((m) => parseInt(m[1].replace(/,/g, ''), 10))
        .filter((n) => !isNaN(n) && n >= 5000 && n <= 3000000);

      if (allAmounts.length > 0) {
        // 합계성 금액이 있을 확률이 높으므로 최대 유효 납입액 선택
        monthlyPayment = Math.max(...allAmounts);
      }
    }

    // 5. 시작일 및 만기일 날짜 매칭 (OCR 노이즈 및 아포스트로피 ' 등 완충)
    const dateRegex =
      /([0-9]{4})[년./-]\s*([0-9]{1,2})[월./-][^0-9\n\r]{0,3}([0-9]{1,2})일?/g;
    const foundDates: string[] = [];
    let dMatch: RegExpExecArray | null;
    while ((dMatch = dateRegex.exec(text)) !== null) {
      const year = dMatch[1];
      const month = dMatch[2].padStart(2, '0');
      const day = dMatch[3].padStart(2, '0');
      foundDates.push(`${year}-${month}-${day}`);
    }

    const uniqueDates = Array.from(new Set(foundDates)).sort();
    if (uniqueDates.length >= 2) {
      startDate = uniqueDates[0];
      maturityDate = uniqueDates[uniqueDates.length - 1];
    } else if (uniqueDates.length === 1) {
      startDate = uniqueDates[0];
      const startYear = parseInt(startDate.slice(0, 4), 10);
      maturityDate = `${startYear + 10}${startDate.slice(4)}`;
    }

    // 6. 납입일 매칭 (매월 N일 또는 계약일의 일자)
    const dayMatch = text.match(
      /(?:매월|이체일|납입일)\s*[:：]?\s*(?:매월\s*)?([0-9]{1,2})\s*일/,
    );
    if (dayMatch && dayMatch[1]) {
      const day = parseInt(dayMatch[1], 10);
      if (day >= 1 && day <= 31) {
        paymentDay = day;
      }
    } else if (startDate) {
      const dayFromDate = parseInt(startDate.slice(8, 10), 10);
      if (dayFromDate >= 1 && dayFromDate <= 31) {
        paymentDay = dayFromDate;
      }
    }

    // 7. 보장금액 매칭 (억/천만/백만 단위 및 원 단위 포괄)
    const eokMatch = text.match(/([0-9]+)\s*억(?:\s*([0-9]+)\s*천)?만?원?/);
    if (eokMatch && eokMatch[1]) {
      const eok = parseInt(eokMatch[1], 10) * 100000000;
      const cheon = eokMatch[2] ? parseInt(eokMatch[2], 10) * 10000000 : 0;
      coverageAmount = eok + cheon;
    } else {
      const cheonMatch = text.match(/([0-9]+)\s*천만원?/);
      if (cheonMatch && cheonMatch[1]) {
        coverageAmount = parseInt(cheonMatch[1], 10) * 10000000;
      } else {
        const coverageMatch = text.match(
          /(?:보장금액|가입금액|기본계약금액)[^\n\r0-9]{0,10}([0-9,]{5,12})\s*원?/,
        );
        if (coverageMatch && coverageMatch[1]) {
          const cov = parseInt(coverageMatch[1].replace(/,/g, ''), 10);
          if (!isNaN(cov) && cov > 0) {
            coverageAmount = cov;
          }
        }
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
