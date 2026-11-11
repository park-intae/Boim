import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from '../pages/HomePage';
import { useAppStore } from '../store/useAppStore';
import { useGetInsurances } from '../api/useInsuranceQueries';
import { useGetNotifications } from '../api/useNotificationQueries';

vi.mock('../api/useInsuranceQueries', () => ({
  useGetInsurances: vi.fn(),
}));

vi.mock('../api/useNotificationQueries', () => ({
  useGetNotifications: vi.fn(),
}));

vi.mock('../components/calendar/MainCalendar', () => ({
  MainCalendar: () => <div data-testid="mock-calendar" />,
}));

describe('HomePage Component', () => {
  const initialStoreState = useAppStore.getState();

  beforeEach(() => {
    useAppStore.setState(initialStoreState, true);
    vi.clearAllMocks();

    (useGetInsurances as Mock).mockReturnValue({
      data: [
        {
          id: 1,
          category: '실비보험',
          name: '실손의료비',
          monthlyPayment: 30000,
          maturityDate: new Date().toISOString(), // 이번 달 만기
        },
        {
          id: 2,
          category: '암보험',
          name: '암보장케어',
          monthlyPayment: 50000,
          maturityDate: '2045-12-31',
        },
      ],
    });

    (useGetNotifications as Mock).mockReturnValue({
      data: [
        {
          id: 'n1',
          type: 'payment',
          title: '보험료 납입일 안내',
          message: '보험료 납부 예정',
          isRead: false,
        },
        {
          id: 'n2',
          type: 'payment',
          title: '보험료 미납 주의',
          message: '미납 안내',
          isRead: false,
        },
        {
          id: 'n3',
          type: 'maturity',
          title: '만기 안내',
          message: '만기 예정',
          isRead: true, // 읽음
        },
      ],
    });
  });

  it('4개 요약 카드가 실제 계산된 통계값으로 렌더링되어야 한다.', () => {
    render(<HomePage />);

    // 1. 가입 보험: 2건 & 4. 미납 알림: 2건
    expect(screen.getByText('가입 보험')).toBeInTheDocument();
    expect(screen.getByText('미납 알림')).toBeInTheDocument();
    expect(screen.getAllByText('2')).toHaveLength(2);

    // 2. 이번 달 납입: 80,000원
    expect(screen.getByText('이번 달 납입')).toBeInTheDocument();
    expect(screen.getByText('80,000')).toBeInTheDocument();

    // 3. 이번 달 갱신/만기: 1건
    expect(screen.getByText('이번 달 갱신/만기')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // 4. 미납 알림: 2건 (읽지 않은 결제 알림 2건)
    expect(screen.getByText('미납 알림')).toBeInTheDocument();
  });

  it('미납 알림 카드 클릭 시 panelMode가 notifications로 변경되어야 한다.', () => {
    render(<HomePage />);

    const unpaidCardTitle = screen.getByText('미납 알림');
    fireEvent.click(unpaidCardTitle);

    expect(useAppStore.getState().panelMode).toBe('notifications');
  });

  it('가입 보험 카드 클릭 시 panelMode가 my-insurance로 변경되어야 한다.', () => {
    render(<HomePage />);

    const card = screen.getByText('가입 보험');
    fireEvent.click(card);

    expect(useAppStore.getState().panelMode).toBe('my-insurance');
  });

  it('이번 달 납입 카드 클릭 시 panelMode가 analysis로 변경되어야 한다.', () => {
    render(<HomePage />);

    const card = screen.getByText('이번 달 납입');
    fireEvent.click(card);

    expect(useAppStore.getState().panelMode).toBe('analysis');
  });
});
