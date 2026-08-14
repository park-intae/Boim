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
});
