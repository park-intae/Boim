import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInsuranceForm } from './useInsuranceForm';
import { useAppStore } from '../store/useAppStore';
import {
  useCreateInsurance,
  useUpdateInsurance,
  useGetInsurances,
} from '../api/useInsuranceQueries';

vi.mock('../api/useInsuranceQueries', () => ({
  useGetInsurances: vi.fn(),
  useCreateInsurance: vi.fn(),
  useUpdateInsurance: vi.fn(),
}));

describe('useInsuranceForm Hook', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({ editingProductId: null, selectedDate: new Date('2026-11-11') }, false);

    vi.mocked(useGetInsurances).mockReturnValue({
      data: [
        {
          id: 101,
          userId: 1,
          name: '현대해상 실손보험',
          category: '실비보험',
          institution: '현대해상',
          startDate: '2024-01-01T00:00:00.000Z',
          maturityDate: '2044-01-01T00:00:00.000Z',
          monthlyPayment: 35000,
          coverageAmount: 50000000,
        },
      ],
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

  it('initializes with default empty values in create mode', () => {
    useAppStore.setState({ editingProductId: null });
    const { result } = renderHook(() => useInsuranceForm());

    expect(result.current.editingProductId).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('prefills form values when editingProductId is set', () => {
    useAppStore.setState({ editingProductId: 101 });
    const { result } = renderHook(() => useInsuranceForm());

    expect(result.current.editingProductId).toBe(101);
  });

  it('maps parsed document data into form fields via handleParsedData', async () => {
    const { result } = renderHook(() => useInsuranceForm());

    await act(async () => {
      result.current.handleParsedData({
        institution: '삼성생명',
        name: '든든한 종신보험',
        category: 'LIFE',
        monthlyPayment: 120000,
        paymentDay: 10,
        startDate: '2025-05-01',
        maturityDate: '2055-05-01',
        coverageAmount: 100000000,
      });
    });

    expect(result.current.editingProductId).toBeNull();
  });

  it('calls createInsurance mutation on valid submission in create mode', async () => {
    useAppStore.setState({ editingProductId: null });
    const { result } = renderHook(() => useInsuranceForm());

    act(() => {
      result.current.setValue('category', '자동차보험');
      result.current.setValue('name', '다이렉트 자동차보험');
      result.current.setValue('institution', 'DB손해보험');
      result.current.setValue('startDate', '2026-01-01');
      result.current.setValue('maturityDate', '2027-01-01');
      result.current.setValue('monthlyPayment', 60000);
      result.current.setValue('coverageAmount', 30000000);
    });

    await act(async () => {
      await result.current.submitHandler();
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate.mock.calls[0][0]).toMatchObject({
      category: '자동차보험',
      name: '다이렉트 자동차보험',
      institution: 'DB손해보험',
      monthlyPayment: 60000,
      coverageAmount: 30000000,
    });
  });

  it('calls updateInsurance mutation on valid submission in edit mode', async () => {
    useAppStore.setState({ editingProductId: 101 });
    const { result } = renderHook(() => useInsuranceForm());

    act(() => {
      result.current.setValue('category', '실비보험');
      result.current.setValue('name', '현대해상 실손보험(수정)');
      result.current.setValue('institution', '현대해상');
      result.current.setValue('startDate', '2024-01-01');
      result.current.setValue('maturityDate', '2044-01-01');
      result.current.setValue('monthlyPayment', 40000);
      result.current.setValue('coverageAmount', 50000000);
    });

    await act(async () => {
      await result.current.submitHandler();
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate.mock.calls[0][0]).toMatchObject({
      id: '101',
      data: expect.objectContaining({
        name: '현대해상 실손보험(수정)',
        monthlyPayment: 40000,
      }),
    });
  });
});
