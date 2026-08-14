import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../components/layout/Sidebar';
import { useAppStore } from '../store/useAppStore';

// Mock API hook
vi.mock('../api/useInsuranceQueries', () => ({
  useGetInsurances: vi.fn(() => ({ data: [] }))
}));

describe('Sidebar Component', () => {
  const initialStoreState = useAppStore.getState();

  beforeEach(() => {
    // 스토어 초기화 (전체 상태 복원)
    useAppStore.setState(initialStoreState, true);
  });

  it('기본 상태에서는 "보험 일정" 메뉴가 활성화되어야 한다.', () => {
    render(<Sidebar />);
    const activeMenuItem = screen.getByText('보험 일정');
    expect(activeMenuItem.className).toContain('font-bold');
  });

  it('"내 보험" 메뉴를 클릭하면 panelMode가 "my-insurance"로 변경되어야 한다.', () => {
    render(<Sidebar />);
    
    const myInsuranceMenu = screen.getByText('내 보험');
    fireEvent.click(myInsuranceMenu);
    
    // Zustand 스토어 상태 검증
    expect(useAppStore.getState().panelMode).toBe('my-insurance');
  });

  it('panelMode가 "my-insurance"일 때 "내 보험" 메뉴가 활성화 스타일을 가져야 한다.', () => {
    // 스토어 상태를 강제로 my-insurance로 변경
    useAppStore.setState({ panelMode: 'my-insurance' });
    render(<Sidebar />);
    
    const myInsuranceMenu = screen.getByText('내 보험');
    const scheduleMenu = screen.getByText('보험 일정');
    
    expect(myInsuranceMenu.className).toContain('font-bold');
    expect(scheduleMenu.className).not.toContain('font-bold');
  });
});
