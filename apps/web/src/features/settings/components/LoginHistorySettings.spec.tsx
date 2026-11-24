import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginHistorySettings } from './LoginHistorySettings';
import * as userQueries from '../../../api/useUserQueries';
import { mockLoginHistories } from '../../../test/fixtures';

vi.mock('../../../api/useUserQueries', () => ({
  useGetLoginHistory: vi.fn(),
}));

describe('LoginHistorySettings Component', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login history list with device, location, and ip info', () => {
    vi.mocked(userQueries.useGetLoginHistory).mockReturnValue({
      data: mockLoginHistories,
    } as unknown as ReturnType<typeof userQueries.useGetLoginHistory>);

    render(<LoginHistorySettings onBack={mockOnBack} />);

    expect(screen.getByText('로그인 기록')).toBeInTheDocument();
    expect(screen.getByText('Chrome / Windows')).toBeInTheDocument();
    expect(screen.getByText('Safari / iPhone')).toBeInTheDocument();
    expect(screen.getByText(/서울, 대한민국 • 127\.0\.0\.1/)).toBeInTheDocument();
    expect(screen.getByText(/경기 성남시, 대한민국 • 211\.234\.12\.34/)).toBeInTheDocument();
  });

  it('renders empty message when there are no login records', () => {
    vi.mocked(userQueries.useGetLoginHistory).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof userQueries.useGetLoginHistory>);

    render(<LoginHistorySettings onBack={mockOnBack} />);

    expect(screen.getByText('로그인 기록이 없습니다.')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    vi.mocked(userQueries.useGetLoginHistory).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof userQueries.useGetLoginHistory>);

    render(<LoginHistorySettings onBack={mockOnBack} />);
    const backBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(backBtn);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('location이 null인 기록은 알 수 없는 위치로 폴백 표시되어야 한다.', async () => {
    const { useGetLoginHistory } = await import('../../../api/useUserQueries');
    vi.mocked(useGetLoginHistory).mockReturnValue({
      data: [
        {
          id: 99,
          device: 'Windows PC',
          location: null,
          ipAddress: '10.0.0.1',
          loginAt: '2026-04-01T10:00:00.000Z',
        },
      ],
    } as never);

    render(<LoginHistorySettings onBack={vi.fn()} />);
    expect(screen.getByText(/알 수 없는 위치 • 10\.0\.0\.1/)).toBeInTheDocument();
  });

  it('로그인 기록이 비어있을 때 빈 상태 안내 문구를 표시해야 한다.', async () => {
    const { useGetLoginHistory } = await import('../../../api/useUserQueries');
    vi.mocked(useGetLoginHistory).mockReturnValue({
      data: [],
    } as never);

    render(<LoginHistorySettings onBack={vi.fn()} />);
    expect(screen.getByText('로그인 기록이 없습니다.')).toBeInTheDocument();
  });
});
