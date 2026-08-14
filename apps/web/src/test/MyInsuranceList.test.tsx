import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyInsuranceList } from '../components/layout/MyInsuranceList';
import { useGetInsurances, useDeleteInsurance } from '../api/useInsuranceQueries';
import { useAppStore } from '../store/useAppStore';

vi.mock('../api/useInsuranceQueries', () => ({
  useGetInsurances: vi.fn(),
  useDeleteInsurance: vi.fn(() => ({ mutate: vi.fn() })),
}));

describe('MyInsuranceList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('가입한 보험이 없을 경우(Empty State) 안내 문구가 노출되어야 한다.', () => {
    (useGetInsurances as any).mockReturnValue({ data: [] });
    render(<MyInsuranceList />);
    
    expect(screen.getByText('등록된 보험이 없습니다')).toBeInTheDocument();
  });

  it('전달받은 데이터를 기반으로 정상 렌더링되어야 한다.', () => {
    const mockData = [
      { id: 1, name: '무배당 실손의료비보험', category: '실비', institution: 'A생명', monthlyPayment: 30000 },
      { id: 2, name: '다이렉트 자동차보험', category: '자동차', institution: 'B손보', monthlyPayment: 85000 },
    ];
    (useGetInsurances as any).mockReturnValue({ data: mockData });
    render(<MyInsuranceList />);
    
    expect(screen.getByText('무배당 실손의료비보험')).toBeInTheDocument();
    expect(screen.getByText('A생명')).toBeInTheDocument();
    expect(screen.getByText('30,000')).toBeInTheDocument();

    expect(screen.getByText('다이렉트 자동차보험')).toBeInTheDocument();
    expect(screen.getByText('B손보')).toBeInTheDocument();
    expect(screen.getByText('85,000')).toBeInTheDocument();
  });

  it('카테고리 필터 클릭 시 리스트가 올바르게 필터링되어야 한다.', () => {
    const mockData = [
      { id: 1, name: '실비보험', category: '실비', institution: 'A생명', monthlyPayment: 30000 },
      { id: 2, name: '자동차보험', category: '자동차', institution: 'B손보', monthlyPayment: 85000 },
    ];
    (useGetInsurances as any).mockReturnValue({ data: mockData });
    render(<MyInsuranceList />);
    
    // 처음엔 전체가 보이므로 두 개 모두 렌더링됨
    expect(screen.getByText('실비보험')).toBeInTheDocument();
    expect(screen.getByText('자동차보험')).toBeInTheDocument();

    // '실비' 필터 클릭
    fireEvent.click(screen.getByRole('button', { name: '실비' }));
    
    // '실비보험'만 보여야 함
    expect(screen.getByText('실비보험')).toBeInTheDocument();
    expect(screen.queryByText('자동차보험')).not.toBeInTheDocument();

    // '자동차' 필터 클릭
    fireEvent.click(screen.getByRole('button', { name: '자동차' }));
    
    // '자동차보험'만 보여야 함
    expect(screen.queryByText('실비보험')).not.toBeInTheDocument();
    expect(screen.getByText('자동차보험')).toBeInTheDocument();
  });

  it('개별 보험 카드의 상세 보기(수정) 버튼 클릭 시 setEditingProductId가 호출되어야 한다.', () => {
    const mockData = [
      { id: 1, name: '실비보험', category: '실비', institution: 'A생명', monthlyPayment: 30000 },
    ];
    (useGetInsurances as any).mockReturnValue({ data: mockData });
    render(<MyInsuranceList />);

    fireEvent.click(screen.getByText('실비보험').closest('.group') as HTMLElement);
    
    expect(useAppStore.getState().editingProductId).toBe(1);
    expect(useAppStore.getState().panelMode).toBe('form');
  });
});
