import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  DiagnosisScoreCard,
  CoverageProgressList,
  DiagnosisAdviceCards,
} from './index';
import { mockDiagnosisData } from '../../../test/fixtures';

describe('Diagnosis Sub-Components', () => {
  describe('DiagnosisScoreCard', () => {
    it('renders score, summary, and monthly/coverage amounts correctly', () => {
      render(
        <DiagnosisScoreCard
          score={85}
          grade="GOOD"
          summary="보장이 균형 있게 설계되었습니다."
          totalMonthlyPayment={150000}
          totalCoverageAmount={100000000}
        />
      );

      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('우수')).toBeInTheDocument();
      expect(screen.getByText('보장이 균형 있게 설계되었습니다.')).toBeInTheDocument();
      expect(screen.getByText('150,000원')).toBeInTheDocument();
      expect(screen.getByText('100,000,000원')).toBeInTheDocument();
    });

    it('renders different grade badges properly', () => {
      const { rerender } = render(
        <DiagnosisScoreCard
          score={95}
          grade="EXCELLENT"
          summary="최고의 보장입니다."
          totalMonthlyPayment={200000}
        />
      );
      expect(screen.getByText('매우 우수')).toBeInTheDocument();

      rerender(
        <DiagnosisScoreCard
          score={60}
          grade="NORMAL"
          summary="보통 수준입니다."
          totalMonthlyPayment={100000}
        />
      );
      expect(screen.getByText('보통')).toBeInTheDocument();

      rerender(
        <DiagnosisScoreCard
          score={40}
          grade="WARNING"
          summary="보완이 시급합니다."
          totalMonthlyPayment={50000}
        />
      );
      expect(screen.getByText('보완 시급')).toBeInTheDocument();
    });
  });

  describe('CoverageProgressList', () => {
    it('renders category evaluations with current and recommended amounts', () => {
      render(<CoverageProgressList evaluations={mockDiagnosisData.categoryEvaluations} />);

      expect(screen.getByText('카테고리별 보장 적정도')).toBeInTheDocument();
      expect(screen.getByText('암')).toBeInTheDocument();
      expect(screen.getAllByText('적정').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('뇌혈관')).toBeInTheDocument();
      expect(screen.getByText('부족')).toBeInTheDocument();
      expect(screen.getByText('실손')).toBeInTheDocument();
      expect(screen.getByText('진단비 및 수술비 보장이 충분합니다.')).toBeInTheDocument();
    });
  });

  describe('DiagnosisAdviceCards', () => {
    const mockExportExcel = vi.fn();
    const mockPrint = vi.fn();

    it('renders strengths, improvements, and cost saving tips', () => {
      render(
        <DiagnosisAdviceCards
          strengths={['암 진단비가 충분합니다.']}
          improvements={['뇌혈관 진단비를 보강하세요.']}
          costSavingTips={['다이렉트 상품을 비교하세요.']}
          onExportExcel={mockExportExcel}
          onPrint={mockPrint}
          isExporting={false}
        />
      );

      expect(screen.getByText('AI 맞춤형 리모델링 조언')).toBeInTheDocument();
      expect(screen.getByText('든든한 보장 포인트')).toBeInTheDocument();
      expect(screen.getByText('암 진단비가 충분합니다.')).toBeInTheDocument();
      expect(screen.getByText('보완이 필요한 항목')).toBeInTheDocument();
      expect(screen.getByText('뇌혈관 진단비를 보강하세요.')).toBeInTheDocument();
      expect(screen.getByText('월 보험료 절감 팁')).toBeInTheDocument();
      expect(screen.getByText('다이렉트 상품을 비교하세요.')).toBeInTheDocument();
    });

    it('triggers export and print handlers on button click', () => {
      render(
        <DiagnosisAdviceCards
          strengths={[]}
          improvements={[]}
          costSavingTips={[]}
          onExportExcel={mockExportExcel}
          onPrint={mockPrint}
          isExporting={false}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '엑셀(.xlsx) 리포트 저장' }));
      expect(mockExportExcel).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: '인쇄' }));
      expect(mockPrint).toHaveBeenCalledTimes(1);
    });
  });
});
