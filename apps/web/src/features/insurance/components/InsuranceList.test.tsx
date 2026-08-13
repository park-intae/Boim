import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InsuranceList } from './InsuranceList';
import * as hooks from '../hooks/useInsuranceProducts';

// Hook Mocking
vi.mock('../hooks/useInsuranceProducts', () => ({
  useInsuranceProducts: vi.fn(),
}));

describe('InsuranceList Component', () => {
  it('데이터 로딩 중일 때 로딩 텍스트를 표시해야 한다', () => {
    vi.mocked(hooks.useInsuranceProducts).mockReturnValue({ isLoading: true, isError: false, data: undefined } as any);
    render(<InsuranceList />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('데이터가 비어있을 때 안내 문구를 표시해야 한다', () => {
    vi.mocked(hooks.useInsuranceProducts).mockReturnValue({ isLoading: false, isError: false, data: { data: [] } } as any);
    render(<InsuranceList />);
    expect(screen.getByText('등록된 보험 상품이 없습니다.')).toBeInTheDocument();
  });

  it('상품 목록이 성공적으로 렌더링되어야 한다', () => {
    vi.mocked(hooks.useInsuranceProducts).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: [
          { id: 1, category: '생명보험', name: '든든한 생명보험', institution: '삼성생명', monthlyPayment: 150000 },
        ],
      },
    } as any);

    render(<InsuranceList />);
    expect(screen.getByText('든든한 생명보험')).toBeInTheDocument();
    expect(screen.getByText('삼성생명')).toBeInTheDocument();
    expect(screen.getByText('150,000원')).toBeInTheDocument();
  });
});
