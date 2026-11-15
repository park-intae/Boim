import { addDays, format, setDate } from 'date-fns';
import type {
  CreateInsuranceProductDto,
  DocumentParseResponse,
  InsuranceDiagnosisDto,
  InsuranceProductDto,
  LoginHistoryDto,
  NotificationSettingsDto,
  ParsedInsuranceData,
  UpdateInsuranceProductDto,
  UpdateNotificationSettingsDto,
  UpdateUserDto,
  UserDto,
} from '@boim/shared-types';
import { useAuthStore, type User } from '../store/authStore';
import type { NotificationDto, TriggerBatchResult } from '../../../api/useNotificationQueries';

export const DEMO_EMAIL = 'demo@boim.com';
export const DEMO_ACCESS_TOKEN = 'demo-access-token';

/**
 * 입력된 이메일이 웹 데모 전용 계정(demo@boim.com)인지 판별합니다.
 */
export function isDemoAccountEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === DEMO_EMAIL;
}

/**
 * 현재 로그인된 세션이 웹 데모 전용 계정(demo@boim.com)인지 확인합니다.
 */
export function isDemoSession(): boolean {
  const { user, accessToken } = useAuthStore.getState();
  return isDemoAccountEmail(user?.email) || accessToken === DEMO_ACCESS_TOKEN;
}

/**
 * 데모 로그인 시 AuthStore에 저장할 기본 사용자 정보를 반환합니다.
 */
export function getDemoAuthUser(): User {
  return {
    id: 'demo_user_1',
    email: DEMO_EMAIL,
    name: '데모 사용자',
    profileImage: null,
    isPassVerified: true,
  };
}

/**
 * 커밋 히스토리(Phase 03~04, Phase 14, Phase 19)에 존재했던 초기 보험 더미 데이터들을
 * 현재 달력 기준일과 조합하여 생성합니다.
 */
function createInitialDemoInsurances(): InsuranceProductDto[] {
  const now = new Date();
  const todayIso = format(now, "yyyy-MM-dd'T'00:00:00.000'Z'");
  const renewalMaturityIso = format(addDays(now, 2), "yyyy-MM-dd'T'00:00:00.000'Z'");
  const fifteenthIso = format(setDate(now, 15), "yyyy-MM-dd'T'00:00:00.000'Z'");

  return [
    {
      id: 1,
      userId: 1,
      category: '실비보험',
      name: '무배당 삼성화재 다이렉트 실손의료비보험',
      institution: '삼성화재',
      startDate: todayIso,
      maturityDate: '2044-03-14T00:00:00.000Z',
      monthlyPayment: 38500,
      coverageAmount: 50000000,
      createdAt: '2024-03-14T00:00:00.000Z',
      updatedAt: '2024-03-14T00:00:00.000Z',
    },
    {
      id: 2,
      userId: 1,
      category: '암보험',
      name: '한화생명 The스마트 암보험',
      institution: '한화생명',
      startDate: '2023-11-25T00:00:00.000Z',
      maturityDate: '2053-11-25T00:00:00.000Z',
      monthlyPayment: 85000,
      coverageAmount: 100000000,
      createdAt: '2023-11-25T00:00:00.000Z',
      updatedAt: '2023-11-25T00:00:00.000Z',
    },
    {
      id: 3,
      userId: 1,
      category: '자동차보험',
      name: '다이렉트 자동차보험',
      institution: '현대해상',
      startDate: '2025-11-20T00:00:00.000Z',
      maturityDate: renewalMaturityIso,
      monthlyPayment: 70000,
      coverageAmount: 100000000,
      createdAt: '2025-11-20T00:00:00.000Z',
      updatedAt: '2025-11-20T00:00:00.000Z',
    },
    {
      id: 4,
      userId: 1,
      category: '건강보험',
      name: '무배당 굿앤굿어린이종합보험',
      institution: '현대해상',
      startDate: '2023-01-15T00:00:00.000Z',
      maturityDate: '2053-01-15T00:00:00.000Z',
      monthlyPayment: 120000,
      coverageAmount: 50000000,
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2023-01-15T00:00:00.000Z',
    },
    {
      id: 5,
      userId: 1,
      category: '자동차보험',
      name: 'DB손해보험 참좋은 운전자보험',
      institution: 'DB손해보험',
      startDate: '2025-01-10T00:00:00.000Z',
      maturityDate: '2035-01-10T00:00:00.000Z',
      monthlyPayment: 21500,
      coverageAmount: 30000000,
      createdAt: '2025-01-10T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
    },
    {
      id: 6,
      userId: 1,
      category: '암보험',
      name: 'KB 암케어종합치료보험',
      institution: 'KB손해보험',
      startDate: '2024-03-01T00:00:00.000Z',
      maturityDate: '2064-03-01T00:00:00.000Z',
      monthlyPayment: 58000,
      coverageAmount: 30000000,
      createdAt: '2024-03-01T00:00:00.000Z',
      updatedAt: '2024-03-01T00:00:00.000Z',
    },
    {
      id: 7,
      userId: 1,
      category: '종신보험',
      name: '교보생명 든든한 연금저축 종신보험',
      institution: '교보생명',
      startDate: fifteenthIso,
      maturityDate: '2042-06-15T00:00:00.000Z',
      monthlyPayment: 100000,
      coverageAmount: 50000000,
      createdAt: '2022-06-15T00:00:00.000Z',
      updatedAt: '2022-06-15T00:00:00.000Z',
    },
  ];
}

function createInitialDemoNotifications(): NotificationDto[] {
  return [
    {
      id: 'demo-notif-1',
      userId: '1',
      productId: '1',
      type: 'payment',
      title: '실손의료비보험 납입일 안내',
      message: '오늘 무배당 삼성화재 다이렉트 실손의료비보험(38,500원) 정기 납입일입니다.',
      channel: 'in_app',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'demo-notif-2',
      userId: '1',
      productId: '3',
      type: 'renewal',
      title: '다이렉트 자동차보험 만기/갱신 안내',
      message: '가입하신 현대해상 다이렉트 자동차보험의 만기가 이번 달 도래합니다. 갱신을 준비해주세요.',
      channel: 'in_app',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: 'demo-notif-3',
      userId: '1',
      productId: '4',
      type: 'payment',
      title: '보험료 납입 예정 안내',
      message: '현대해상 무배당 굿앤굿어린이종합보험 매월 15일 정기 납입 일정이 등록되어 있습니다.',
      channel: 'email',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'demo-notif-4',
      userId: '1',
      productId: null,
      type: 'info',
      title: 'Boim AI 보장 분석 리포트 준비 완료',
      message: '보유하신 7건의 보험 내역을 바탕으로 AI 종합 진단 리포트가 생성되었습니다.',
      channel: 'push',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
  ];
}

// 인메모리 데모 상태 저장소
let demoInsurances: InsuranceProductDto[] = createInitialDemoInsurances();
let demoNotifications: NotificationDto[] = createInitialDemoNotifications();
let demoProfile: UserDto = {
  id: 1,
  email: DEMO_EMAIL,
  name: '데모 사용자',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};
let demoNotificationSettings: NotificationSettingsDto = {
  pushEnabled: true,
  emailEnabled: true,
  kakaoEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

/**
 * 데모 데이터를 초기 상태로 리셋합니다.
 */
export function resetDemoFallbackState(): void {
  demoInsurances = createInitialDemoInsurances();
  demoNotifications = createInitialDemoNotifications();
  demoProfile = {
    id: 1,
    email: DEMO_EMAIL,
    name: '데모 사용자',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  };
  demoNotificationSettings = {
    pushEnabled: true,
    emailEnabled: true,
    kakaoEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  };
}

// --- 보험 상품 CRUD 데모 핸들러 ---

export function getDemoInsurances(): InsuranceProductDto[] {
  return [...demoInsurances];
}

export function getDemoInsuranceById(id: string | number | bigint): InsuranceProductDto {
  const found = demoInsurances.find((item) => String(item.id) === String(id));
  if (!found) {
    throw new Error('해당 보험 상품을 찾을 수 없습니다.');
  }
  return { ...found };
}

export function createDemoInsurance(dto: CreateInsuranceProductDto): InsuranceProductDto {
  const nextId =
    demoInsurances.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  const nowIso = new Date().toISOString();
  const created: InsuranceProductDto = {
    id: nextId,
    userId: 1,
    category: dto.category,
    name: dto.name,
    institution: dto.institution,
    startDate: new Date(dto.startDate).toISOString(),
    maturityDate: new Date(dto.maturityDate).toISOString(),
    monthlyPayment: Number(dto.monthlyPayment),
    coverageAmount: Number(dto.coverageAmount),
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  demoInsurances = [created, ...demoInsurances];
  return { ...created };
}

export function updateDemoInsurance(
  id: string | number | bigint,
  dto: UpdateInsuranceProductDto,
): InsuranceProductDto {
  const index = demoInsurances.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    throw new Error('수정할 보험 상품을 찾을 수 없습니다.');
  }

  const current = demoInsurances[index];
  const updated: InsuranceProductDto = {
    ...current,
    ...dto,
    startDate: dto.startDate ? new Date(dto.startDate).toISOString() : current.startDate,
    maturityDate: dto.maturityDate ? new Date(dto.maturityDate).toISOString() : current.maturityDate,
    monthlyPayment:
      dto.monthlyPayment !== undefined ? Number(dto.monthlyPayment) : current.monthlyPayment,
    coverageAmount:
      dto.coverageAmount !== undefined ? Number(dto.coverageAmount) : current.coverageAmount,
    updatedAt: new Date().toISOString(),
  };

  demoInsurances = demoInsurances.map((item, idx) => (idx === index ? updated : item));
  return { ...updated };
}

export function deleteDemoInsurance(id: string | number | bigint): void {
  demoInsurances = demoInsurances.filter((item) => String(item.id) !== String(id));
}

// --- 알림 데모 핸들러 ---

export function getDemoNotifications(): NotificationDto[] {
  return [...demoNotifications];
}

export function markDemoNotificationRead(id: string): NotificationDto {
  let target: NotificationDto | undefined;
  demoNotifications = demoNotifications.map((n) => {
    if (n.id === id) {
      target = { ...n, isRead: true };
      return target;
    }
    return n;
  });
  if (!target) {
    throw new Error('해당 알림을 찾을 수 없습니다.');
  }
  return target;
}

export function markAllDemoNotificationsRead(): { count: number } {
  let count = 0;
  demoNotifications = demoNotifications.map((n) => {
    if (!n.isRead) {
      count += 1;
      return { ...n, isRead: true };
    }
    return n;
  });
  return { count };
}

export function deleteDemoNotification(id: string): boolean {
  demoNotifications = demoNotifications.filter((n) => n.id !== id);
  return true;
}

export function triggerDemoBatch(targetDate?: string): TriggerBatchResult {
  return {
    success: true,
    targetDate: targetDate || format(new Date(), 'yyyy-MM-dd'),
    scannedProducts: demoInsurances.length,
    createdNotifications: 0,
    skippedCount: demoInsurances.length,
  };
}

// --- AI 종합 진단 데모 핸들러 ---

export function getDemoDiagnosis(): InsuranceDiagnosisDto {
  const totalMonthlyPayment = demoInsurances.reduce((sum, i) => sum + i.monthlyPayment, 0);
  const totalCoverageAmount = demoInsurances.reduce(
    (sum, i) => sum + Number(i.coverageAmount),
    0,
  );

  return {
    score: 88,
    grade: 'EXCELLENT',
    summary:
      '실손의료비, 암, 자동차, 건강/종신까지 핵심 보장 밸런스가 매우 우수하게 구성되어 있습니다. 뇌/심혈관 진단비 특약 보강 시 더욱 완벽한 보장이 완성됩니다.',
    totalMonthlyPayment,
    totalCoverageAmount,
    categoryEvaluations: [
      {
        category: '실손의료비',
        currentAmount: 50000000,
        recommendedAmount: 50000000,
        status: 'ADEQUATE',
        comment: '실손의료비 보장이 권장 한도(5,000만원)에 맞춰 든든하게 설계되어 있습니다.',
      },
      {
        category: '암/중대질환 보장',
        currentAmount: 130000000,
        recommendedAmount: 100000000,
        status: 'ADEQUATE',
        comment: '한화생명 및 KB손해보험 암보험을 통해 고액 암 치료비가 안정적으로 확보되어 있습니다.',
      },
      {
        category: '뇌/심혈관 질환',
        currentAmount: 30000000,
        recommendedAmount: 50000000,
        status: 'UNDER_COVERED',
        comment: '허혈성 심장질환 및 뇌혈관질환 진단비 특약을 2,000만원가량 추가 보강하는 것을 권장합니다.',
      },
      {
        category: '자동차/운전자 보장',
        currentAmount: 130000000,
        recommendedAmount: 100000000,
        status: 'ADEQUATE',
        comment: '자동차보험 및 운전자보험 형사합의금·벌금 담보가 적정 수준으로 유지 중입니다.',
      },
    ],
    strengths: [
      '실손의료비와 2건의 암보험 조합으로 중대 질병 발생 시 의료비 및 생활자금 방어력이 뛰어납니다.',
      '어린이/건강 종합보장과 종신/연금 보장이 균형 있게 배분되어 생애주기별 리스크에 잘 대비되어 있습니다.',
    ],
    improvements: [
      '뇌혈관 및 허혈성 심장질환 진단비가 권장 수준(5,000만원) 대비 다소 부족하므로 특약 보강을 검토해보세요.',
      '이번 달 만기가 도래하는 현대해상 다이렉트 자동차보험의 갱신 특약(주행거리 할인 등)을 점검하세요.',
    ],
    costSavingTips: [
      '건강보험과 실손보험 간 중복 가입된 상해 입원일당 특약을 정리하면 월 약 12,000원을 절감할 수 있습니다.',
      '자동차보험 갱신 시 마일리지 특약 및 안전운전 점수 할인을 적용하면 연 최대 18% 보험료 절감이 가능합니다.',
    ],
    generatedAt: new Date().toISOString(),
    isFallback: true,
  };
}

// --- 사용자 설정 및 프로필 데모 핸들러 ---

export function getDemoProfile(): UserDto {
  return { ...demoProfile };
}

export function updateDemoProfile(dto: UpdateUserDto): UserDto {
  demoProfile = {
    ...demoProfile,
    ...dto,
  };
  return { ...demoProfile };
}

export function getDemoNotificationSettings(): NotificationSettingsDto {
  return { ...demoNotificationSettings };
}

export function updateDemoNotificationSettings(
  dto: UpdateNotificationSettingsDto,
): NotificationSettingsDto {
  demoNotificationSettings = {
    ...demoNotificationSettings,
    ...dto,
  };
  return { ...demoNotificationSettings };
}

export function getDemoLoginHistories(): LoginHistoryDto[] {
  return [
    {
      id: 1,
      userId: 1,
      device: 'Chrome / Web Demo',
      ipAddress: '127.0.0.1',
      location: '서울, 대한민국',
      loginAt: new Date().toISOString(),
    },
    {
      id: 2,
      userId: 1,
      device: 'Safari / iPhone',
      ipAddress: '211.234.12.34',
      location: '경기 성남시, 대한민국',
      loginAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];
}

// --- 문서/증권 샘플 분석 데모 핸들러 ---

export function getDemoSamplePreset(): {
  sampleName: string;
  fileName: string;
  mimeType: string;
  presetData: ParsedInsuranceData;
  mockData: ParsedInsuranceData;
} {
  const sample: ParsedInsuranceData = {
    institution: '현대해상',
    name: '무배당 현대해상 다이렉트 실손의료비보험',
    category: '실비보험',
    monthlyPayment: 34500,
    coverageAmount: 50000000,
    startDate: '2025-03-01',
    maturityDate: '2045-03-01',
    confidence: 0.96,
  };
  return {
    sampleName: '현대해상 실손의료비보험 표준 샘플',
    fileName: 'sample_hyundai_silbi_policy.pdf',
    mimeType: 'application/pdf',
    presetData: sample,
    mockData: sample,
  };
}

export function parseDemoSampleDocument(): DocumentParseResponse {
  const { presetData } = getDemoSamplePreset();
  return {
    documentId: 999,
    ocrText:
      '보험증권 기관명: 현대해상 상품명: 무배당 현대해상 다이렉트 실손의료비보험 월납보험료: 34,500원',
    parsedData: presetData,
  };
}
