import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InsuranceForm } from '../components/layout/InsuranceForm';
import { useAppStore } from '../store/useAppStore';
import { useCreateInsurance, useUpdateInsurance, useGetInsurances } from '../api/useInsuranceQueries';
import type { ParsedInsuranceData } from '@boim/shared-types';

// 모킹
vi.mock('../api/useInsuranceQueries', () => ({
  useGetInsurances: vi.fn(),
  useCreateInsurance: vi.fn(),
  useUpdateInsurance: vi.fn(),
}));

vi.mock('../components/layout/PolicyDocumentUploader', () => ({
  PolicyDocumentUploader: ({ onParsed }: { onParsed: (data: ParsedInsuranceData) => void }) => {
    return (
      <div data-testid="mock-uploader">
        <button
          type="button"
          onClick={() =>
            onParsed({
              institution: '한화손해보험',
              name: '무배당 한화 라이프케어 건강종합보험',
              category: 'HEALTH',
              monthlyPayment: 85000,
              paymentDay: 15,
              startDate: '2024-03-01',
              maturityDate: '2044-03-01',
              coverageAmount: 50000000,
            })
          }
        >
          모의 분석 트리거
        </button>
      </div>
    );
  },
}));

describe('InsuranceForm Component', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState(useAppStore.getState(), true);

    vi.mocked(useGetInsurances).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useGetInsurances>);

    vi.mocked(useCreateInsurance).mockReturnValue({
      mutate: mockCreate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateInsurance>);

    vi.mocked(useUpdateInsurance).mockReturnValue({
      mutate: mockUpdate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateInsurance>);
  });

  it('폼의 필수 항목들을 입력하지 않고 제출하면 유효성 검사 에러 메시지가 표시되어야 한다.', async () => {
    render(<InsuranceForm />);

    const submitBtn = screen.getByRole('button', { name: /보험 등록 완료하기/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('카테고리를 선택해주세요.')).toBeInTheDocument();
      expect(screen.getByText('보험 상품명을 입력해주세요.')).toBeInTheDocument();
      expect(screen.getByText('보험사명을 입력해주세요.')).toBeInTheDocument();
    });

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('올바른 데이터를 입력하고 제출하면 create 함수가 호출되어야 한다.', async () => {
    render(<InsuranceForm />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '자동차보험' } });
    fireEvent.change(screen.getByPlaceholderText('예) 무배당 굿앤굿 어린이종합보험'), {
      target: { value: '다이렉트 자동차' },
    });
    fireEvent.change(screen.getByPlaceholderText('예) 현대해상'), {
      target: { value: 'DB손해보험' },
    });

    // 금액 입력
    const inputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(inputs[0], { target: { value: '50000' } }); // 월 납입액
    fireEvent.change(inputs[1], { target: { value: '10000000' } }); // 보장 금액

    const submitBtn = screen.getByRole('button', { name: /보험 등록 완료하기/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate.mock.calls[0][0]).toMatchObject({
        category: '자동차보험',
        name: '다이렉트 자동차',
        institution: 'DB손해보험',
        monthlyPayment: 50000,
        coverageAmount: 10000000,
      });
    });
  });

  it('증권 분석 데이터 수신 시 폼의 입력 필드들이 자동으로 채워져야 한다 (Prefill)', async () => {
    render(<InsuranceForm />);

    const triggerBtn = screen.getByText('모의 분석 트리거');
    fireEvent.click(triggerBtn);

    await waitFor(() => {
      expect(screen.getByDisplayValue('한화손해보험')).toBeInTheDocument();
      expect(screen.getByDisplayValue('무배당 한화 라이프케어 건강종합보험')).toBeInTheDocument();
      expect(screen.getByDisplayValue('85000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('50000000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-03-01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2044-03-01')).toBeInTheDocument();
    });
  });

  it('수정 모드(editingProductId 존재)일 때 기존 데이터가 채워지고 제출 시 updateInsurance가 호출되어야 한다.', async () => {
    useAppStore.setState({ editingProductId: 777 });

    vi.mocked(useGetInsurances).mockReturnValue({
      data: [
        {
          id: 777,
          userId: 1,
          category: '암보험',
          name: '기존 암보험 상품',
          institution: '교보생명',
          startDate: '2023-01-01',
          maturityDate: '2043-01-01',
          monthlyPayment: 60000,
          coverageAmount: 30000000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    } as unknown as ReturnType<typeof useGetInsurances>);

    render(<InsuranceForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('기존 암보험 상품')).toBeInTheDocument();
      expect(screen.getByDisplayValue('교보생명')).toBeInTheDocument();
    });

    // 버튼명 확인
    const submitBtn = screen.getByRole('button', { name: /수정 내용 저장하기/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate.mock.calls[0][0].id).toBe('777');
      expect(mockUpdate.mock.calls[0][0].data.name).toBe('기존 암보험 상품');
    });
  });
});
