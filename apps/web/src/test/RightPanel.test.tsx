import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RightPanel } from '../components/layout/RightPanel';
import { useAppStore } from '../store/useAppStore';
import { useGetInsurances } from '../api/useInsuranceQueries';

// 모킹
vi.mock('../api/useInsuranceQueries', () => ({
  useGetInsurances: vi.fn(),
}));

describe('RightPanel Component', () => {
  beforeEach(() => {
    // 스토어 초기화
    useAppStore.setState(useAppStore.getState(), true);
    
    // API 초기화
    (useGetInsurances as any).mockReturnValue({
      data: []
    });
  });

  it('기본적으로 예정된 일정이 없다는 문구가 나타나야 한다 (Empty State)', () => {
    render(<RightPanel />);
    expect(screen.getByText('예정된 일정이 없습니다')).toBeInTheDocument();
  });

  it('Empty State의 새 보험 등록 버튼 클릭 시 panelMode가 form으로 변경되어야 한다.', () => {
    render(<RightPanel />);
    const registerBtn = screen.getByText('새 보험 등록');
    
    fireEvent.click(registerBtn);
    
    expect(useAppStore.getState().panelMode).toBe('form');
  });

  it('하단 sticky 버튼 클릭 시 panelMode가 form으로 변경되어야 한다.', () => {
    render(<RightPanel />);
    const stickyBtn = screen.getByText('새로운 보험 등록');
    
    fireEvent.click(stickyBtn);
    
    expect(useAppStore.getState().panelMode).toBe('form');
  });
});
