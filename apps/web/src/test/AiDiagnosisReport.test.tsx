import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AiDiagnosisReport } from '../components/layout/AiDiagnosisReport';
import { useAppStore } from '../store/useAppStore';
import {
  useGetDiagnosis,
  useGenerateDiagnosis,
  useExportExcel,
} from '../api/useDiagnosisQueries';
import type { InsuranceDiagnosisDto } from '@boim/shared-types';

vi.mock('../api/useDiagnosisQueries', () => ({
  useGetDiagnosis: vi.fn(),
  useGenerateDiagnosis: vi.fn(),
  useExportExcel: vi.fn(),
}));

const mockDiagnosis: InsuranceDiagnosisDto = {
  score: 85,
  grade: 'GOOD',
  summary: '전반적인 3대 질병 보장이 안정적으로 구성되어 있습니다.',
  totalMonthlyPayment: 150000,
  totalCoverageAmount: 60000000,
  categoryEvaluations: [
    {
      category: '암',
      status: 'ADEQUATE',
      currentAmount: 50000000,
      recommendedAmount: 50000000,
      comment: '암 진단비가 권장 수준에 부합합니다.',
    },
    {
      category: '뇌혈관 질환',
      status: 'UNDER_COVERED',
      currentAmount: 10000000,
      recommendedAmount: 30000000,
      comment: '뇌혈관 질환 보장이 부족하여 보강이 권장됩니다.',
    },
  ],
  strengths: ['암 보장이 탄탄함', '월 납입액이 적정함'],
  improvements: ['뇌혈관 보장 보완 필요'],
  costSavingTips: ['중복된 실손 특약 점검'],
  generatedAt: '2026-11-06T15:00:00.000Z',
  isFallback: true,
};

describe('AiDiagnosisReport Component', () => {
  const initialStoreState = useAppStore.getState();
  const mockRegenerate = vi.fn();
  const mockExportExcel = vi.fn();

  beforeEach(() => {
    useAppStore.setState(initialStoreState, true);
    vi.clearAllMocks();

    (useGenerateDiagnosis as Mock).mockReturnValue({
      mutate: mockRegenerate,
      isPending: false,
    });

    (useExportExcel as Mock).mockReturnValue({
      mutate: mockExportExcel,
      isPending: false,
    });
  });

  it('로딩 중일 때 분석 중 스켈레톤/로딩 UI가 렌더링되어야 한다.', () => {
    (useGetDiagnosis as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AiDiagnosisReport />);
    expect(screen.getByText('AI 종합 진단 리포트를 생성하는 중...')).toBeInTheDocument();
  });

  it('진단 데이터가 없거나 0건일 때 가입 보험 없음 Empty State가 렌더링되어야 한다.', () => {
    (useGetDiagnosis as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AiDiagnosisReport />);
    expect(screen.getByText('등록된 보험이 없습니다')).toBeInTheDocument();

    const addBtn = screen.getByText('새 보험 등록하기');
    fireEvent.click(addBtn);
    expect(useAppStore.getState().panelMode).toBe('form');
  });

  it('진단 리포트가 정상적으로 렌더링되어야 한다 (점수, 등급, 카테고리, 제언, 팁 등)', () => {
    (useGetDiagnosis as Mock).mockReturnValue({
      data: mockDiagnosis,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AiDiagnosisReport />);

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('우수')).toBeInTheDocument();
    expect(screen.getByText('전반적인 3대 질병 보장이 안정적으로 구성되어 있습니다.')).toBeInTheDocument();

    // 카테고리 검증
    expect(screen.getByText('암')).toBeInTheDocument();
    expect(screen.getByText('적정')).toBeInTheDocument();
    expect(screen.getByText('뇌혈관 질환')).toBeInTheDocument();
    expect(screen.getByText('부족')).toBeInTheDocument();

    // 강점/보완점/절감팁
    expect(screen.getByText('암 보장이 탄탄함')).toBeInTheDocument();
    expect(screen.getByText('뇌혈관 보장 보완 필요')).toBeInTheDocument();
    expect(screen.getByText('중복된 실손 특약 점검')).toBeInTheDocument();

    // 규칙 기반 엔진 배지 (isFallback: true)
    expect(screen.getByText('규칙 기반 분석 엔진')).toBeInTheDocument();
  });

  it('AI 재분석 버튼 클릭 시 mutate 함수가 호출되어야 한다.', () => {
    (useGetDiagnosis as Mock).mockReturnValue({
      data: mockDiagnosis,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AiDiagnosisReport />);
    const refreshBtn = screen.getByRole('button', { name: 'AI 재분석' });
    fireEvent.click(refreshBtn);

    expect(mockRegenerate).toHaveBeenCalled();
  });

  it('엑셀 다운로드 버튼 클릭 시 엑셀 다운로드 mutate 함수가 호출되어야 한다.', () => {
    (useGetDiagnosis as Mock).mockReturnValue({
      data: mockDiagnosis,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AiDiagnosisReport />);
    const excelBtn = screen.getByText('엑셀(.xlsx) 리포트 저장');
    fireEvent.click(excelBtn);

    expect(mockExportExcel).toHaveBeenCalled();
  });

  it('인쇄 버튼 클릭 시 window.print가 호출되어야 한다.', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    (useGetDiagnosis as Mock).mockReturnValue({
      data: mockDiagnosis,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AiDiagnosisReport />);
    const printBtn = screen.getByText('인쇄');
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
