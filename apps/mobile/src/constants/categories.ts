export interface CategoryOption {
  key: string;
  label: string;
  color: string;
  icon?: string;
}

export const INSURANCE_CATEGORIES: CategoryOption[] = [
  { key: 'HEALTH', label: '건강/종합/실손', color: '#10b981' },
  { key: 'CANCER', label: '암/3대질병', color: '#ef4444' },
  { key: 'LIFE', label: '종신/정기', color: '#6366f1' },
  { key: 'AUTO', label: '운전자/자동차', color: '#3b82f6' },
  { key: 'DENTAL', label: '치아', color: '#06b6d4' },
  { key: 'CHILD', label: '어린이/태아', color: '#f59e0b' },
  { key: 'FIRE', label: '화재/재물', color: '#f97316' },
  { key: 'PET', label: '반려동물(펫)', color: '#ec4899' },
  { key: 'SAVING', label: '연금/저축', color: '#8b5cf6' },
  { key: 'ETC', label: '기타', color: '#64748b' },
];

export const CATEGORY_MAP: Record<string, string> = {
  ALL: '전체',
  HEALTH: '건강/종합/실손',
  CANCER: '암/3대질병',
  LIFE: '종신/정기',
  AUTO: '운전자/자동차',
  DENTAL: '치아',
  CHILD: '어린이/태아',
  FIRE: '화재/재물',
  PET: '반려동물(펫)',
  SAVING: '연금/저축',
  ETC: '기타',
};
