import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyEventsView } from './DailyEventsView';
import * as insuranceQueries from '../../api/useInsuranceQueries';
import { useAppStore } from '../../store/useAppStore';
import { mockInsuranceProducts } from '../../test/fixtures';

vi.mock('../../api/useInsuranceQueries', () => ({
  useGetInsurances: vi.fn(),
  useDeleteInsurance: vi.fn(),
}));

describe('DailyEventsView Component', () => {
  const mockDeleteInsurance = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    vi.mocked(insuranceQueries.useDeleteInsurance).mockReturnValue({
      mutate: mockDeleteInsurance,
    } as unknown as ReturnType<typeof insuranceQueries.useDeleteInsurance>);

    useAppStore.setState({
      selectedDate: new Date('2023-01-15T00:00:00.000Z'),
      panelMode: 'view',
      editingProductId: null,
    });
  });

  it('renders events for the selected date matching payment day', () => {
    vi.mocked(insuranceQueries.useGetInsurances).mockReturnValue({
      data: mockInsuranceProducts,
    } as unknown as ReturnType<typeof insuranceQueries.useGetInsurances>);

    render(<DailyEventsView />);

    expect(screen.getByText('무배당 굿앤굿어린이종합보험')).toBeInTheDocument();
    expect(screen.getByText('현대해상')).toBeInTheDocument();
    expect(screen.getByText('120,000')).toBeInTheDocument();
    expect(screen.getByText('납입 예정')).toBeInTheDocument();
  });

  it('renders renewal event when maturity date matches selected date', () => {
    useAppStore.setState({
      selectedDate: new Date('2042-05-10T00:00:00.000Z'),
    });

    vi.mocked(insuranceQueries.useGetInsurances).mockReturnValue({
      data: mockInsuranceProducts,
    } as unknown as ReturnType<typeof insuranceQueries.useGetInsurances>);

    render(<DailyEventsView />);

    expect(screen.getAllByText('실손의료비보장보험(갱신형)')[0]).toBeInTheDocument();
    expect(screen.getByText('만기/갱신')).toBeInTheDocument();
  });

  it('navigates to edit form when an event card is clicked', () => {
    vi.mocked(insuranceQueries.useGetInsurances).mockReturnValue({
      data: mockInsuranceProducts,
    } as unknown as ReturnType<typeof insuranceQueries.useGetInsurances>);

    render(<DailyEventsView />);

    const card = screen.getByText('무배당 굿앤굿어린이종합보험').closest('.cursor-pointer');
    if (card) {
      fireEvent.click(card);
      expect(useAppStore.getState().editingProductId).toBe('1');
      expect(useAppStore.getState().panelMode).toBe('form');
    }
  });

  it('calls deleteInsurance when trash button is clicked and confirmed', () => {
    vi.mocked(insuranceQueries.useGetInsurances).mockReturnValue({
      data: mockInsuranceProducts,
    } as unknown as ReturnType<typeof insuranceQueries.useGetInsurances>);

    render(<DailyEventsView />);

    const deleteBtn = screen.getByRole('button', { name: '삭제' });
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith('정말 이 보험 일정을 삭제하시겠습니까?');
    expect(mockDeleteInsurance).toHaveBeenCalledWith('1');
  });

  it('renders empty state when there are no events on selected date', () => {
    useAppStore.setState({
      selectedDate: new Date('2099-12-31T00:00:00.000Z'),
    });

    vi.mocked(insuranceQueries.useGetInsurances).mockReturnValue({
      data: mockInsuranceProducts,
    } as unknown as ReturnType<typeof insuranceQueries.useGetInsurances>);

    render(<DailyEventsView />);

    expect(screen.getByText('예정된 일정이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('새로운 보험을 등록해보세요!')).toBeInTheDocument();

    const emptyAddBtn = screen.getByRole('button', { name: '새 보험 등록' });
    fireEvent.click(emptyAddBtn);
    expect(useAppStore.getState().panelMode).toBe('form');
  });

  it('switches to form mode when bottom sticky button is clicked', () => {
    vi.mocked(insuranceQueries.useGetInsurances).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof insuranceQueries.useGetInsurances>);

    render(<DailyEventsView />);

    const bottomBtn = screen.getByRole('button', { name: '새로운 보험 등록' });
    fireEvent.click(bottomBtn);

    expect(useAppStore.getState().panelMode).toBe('form');
  });
});
