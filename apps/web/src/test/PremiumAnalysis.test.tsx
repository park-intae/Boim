import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PremiumAnalysis } from '../components/layout/PremiumAnalysis';
import { useGetInsurances } from '../api/useInsuranceQueries';

vi.mock('../api/useInsuranceQueries', () => ({
  useGetInsurances: vi.fn(),
}));

// Recharts 모킹 (ResponsiveContainer를 포함하여 내부의 차트가 렌더링되지 않도록 함)
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />
}));

describe('PremiumAnalysis Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('가입한 보험이 없을 경우(Empty State) 안내 문구와 새 보험 등록 버튼이 노출되어야 한다.', () => {
    vi.mocked(useGetInsurances).mockReturnValue({ data: [] } as unknown as ReturnType<typeof useGetInsurances>);
    render(<PremiumAnalysis />);
    
    expect(screen.getByText('분석할 데이터가 없습니다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '새 보험 등록' })).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // 총 납입액 0원
  });

  it('전달받은 데이터를 기반으로 차트 영역과 상세 내역 리스트가 정상 렌더링되어야 한다.', () => {
    const mockData = [
      { id: 1, name: '실비보험', category: '실비', monthlyPayment: 30000 },
      { id: 2, name: '자동차보험', category: '자동차', monthlyPayment: 70000 },
    ];
    vi.mocked(useGetInsurances).mockReturnValue({ data: mockData } as unknown as ReturnType<typeof useGetInsurances>);
    render(<PremiumAnalysis />);
    
    // 30000 + 70000 = 100,000
    expect(screen.getByText('100,000')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();

    // 상세 내역 체크
    expect(screen.getByText('상세 내역')).toBeInTheDocument();
    expect(screen.getByText('실비')).toBeInTheDocument();
    expect(screen.getByText('자동차')).toBeInTheDocument();

    // 100,000원 중 30,000원이면 30%
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });
});
