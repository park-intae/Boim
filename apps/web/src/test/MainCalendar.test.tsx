import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainCalendar } from '../components/calendar/MainCalendar';
import { useAppStore } from '../store/useAppStore';

vi.mock('../api/useInsuranceQueries', () => ({
  useGetInsurances: vi.fn(() => ({ data: [] })),
}));

describe('MainCalendar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('캘린더의 날짜를 클릭하면 해당 날짜가 선택되고 panelMode가 view로 변경되어야 한다.', () => {
    // 1. 초기 상태를 my-insurance로 세팅
    useAppStore.setState({ panelMode: 'my-insurance' });
    
    render(<MainCalendar />);
    
    // 2. 아무 날짜(예: 15일)나 클릭
    // MainCalendar에서 달력 숫자는 div > span 구조로 렌더링됨
    const dayElement = screen.getAllByText('15')[0];
    fireEvent.click(dayElement.closest('div')!);
    
    // 3. 스토어 상태 검증
    const state = useAppStore.getState();
    expect(state.panelMode).toBe('view');
    expect(state.selectedDate.getDate()).toBe(15);
  });

  it('윤년(2024년 2월)에는 2월 29일을 선택할 수 있고 평년(2025년 2월)에는 2월 29일이 존재하지 않아야 한다.', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-15T00:00:00'));

    render(<MainCalendar />);
    expect(screen.getByText('2024년 2월')).toBeInTheDocument();

    // 2024년 2월 달력에는 1월 29일([0])과 2월 29일([1])이 함께 노출됨
    const day29Cells = screen.getAllByText('29');
    expect(day29Cells).toHaveLength(2);
    fireEvent.click(day29Cells[1]);
    expect(useAppStore.getState().selectedDate.getFullYear()).toBe(2024);
    expect(useAppStore.getState().selectedDate.getMonth()).toBe(1);
    expect(useAppStore.getState().selectedDate.getDate()).toBe(29);

    // 다음 연도(2025년 2월)로 이동하면 2월 29일은 없으므로 '29'는 1월 29일(month 0)만 남음
    fireEvent.click(screen.getByRole('button', { name: '다음 연도' }));
    expect(screen.getByText('2025년 2월')).toBeInTheDocument();
    const feb2025Cell29 = screen.getAllByText('29');
    expect(feb2025Cell29).toHaveLength(1);
    fireEvent.click(feb2025Cell29[0]);
    expect(useAppStore.getState().selectedDate.getMonth()).toBe(0);

    vi.useRealTimers();
  });

  it('말일(31일) 납입 보험은 31일이 있는 달에만 납입 뱃지가 표시되고 2월에는 표시되지 않아야 한다.', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T00:00:00'));
    const { useGetInsurances } = await import('../api/useInsuranceQueries');
    vi.mocked(useGetInsurances).mockReturnValue({
      data: [
        {
          id: 1,
          name: '말일보험',
          startDate: '2026-01-31T00:00:00.000Z',
          maturityDate: '2030-01-31T00:00:00.000Z',
        },
      ],
    } as never);

    render(<MainCalendar />);
    expect(screen.getAllByText('말일보험 납입').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: '다음 달' }));
    expect(screen.getByText('2026년 2월')).toBeInTheDocument();
    expect(screen.queryByText('말일보험 납입')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('추가 버튼 클릭 시 panelMode가 form으로 전환되어야 한다.', () => {
    render(<MainCalendar />);
    const addButtons = screen.getAllByRole('button', { name: /추가/i });
    fireEvent.click(addButtons[0]);
    expect(useAppStore.getState().panelMode).toBe('form');
  });
});
