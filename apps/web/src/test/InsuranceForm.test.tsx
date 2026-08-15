import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InsuranceForm } from '../components/layout/InsuranceForm';
import { useAppStore } from '../store/useAppStore';
import { useCreateInsurance, useUpdateInsurance } from '../api/useInsuranceQueries';

// 모킹
vi.mock('../api/useInsuranceQueries', () => ({
  useCreateInsurance: vi.fn(),
  useUpdateInsurance: vi.fn(),
}));

describe('InsuranceForm Component', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState(useAppStore.getState(), true);
    
    vi.mocked(useCreateInsurance).mockReturnValue({ mutate: mockCreate, isPending: false } as unknown as ReturnType<typeof useCreateInsurance>);
    vi.mocked(useUpdateInsurance).mockReturnValue({ mutate: mockUpdate, isPending: false } as unknown as ReturnType<typeof useUpdateInsurance>);
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
    fireEvent.change(screen.getByPlaceholderText('예) 무배당 굿앤굿 어린이종합보험'), { target: { value: '다이렉트 자동차' } });
    fireEvent.change(screen.getByPlaceholderText('예) 현대해상'), { target: { value: 'DB손해보험' } });
    
    // 금액 입력
    const inputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(inputs[0], { target: { value: '50000' } }); // 월 납입액
    fireEvent.change(inputs[1], { target: { value: '10000000' } }); // 보장 금액

    const submitBtn = screen.getByRole('button', { name: /보험 등록 완료하기/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
      // 첫 번째 인자로 payload 객체가 들어갔는지 확인
      expect(mockCreate.mock.calls[0][0]).toMatchObject({
        category: '자동차보험',
        name: '다이렉트 자동차',
        institution: 'DB손해보험',
        monthlyPayment: 50000,
        coverageAmount: 10000000
      });
    });
  });
});
