import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationList } from '../components/layout/NotificationList';
import * as useNotificationQueries from '../api/useNotificationQueries';

// Mock the hooks
vi.mock('../api/useNotificationQueries', () => ({
  useGetNotifications: vi.fn(),
  useMarkNotificationRead: vi.fn(),
  useDeleteNotification: vi.fn(),
}));

const mockNotifications = [
  { id: '1', type: 'payment', title: '보험료 납입일 안내', message: '내일은 (무)무배당 실손의료보험의 납입일입니다. (예상 금액: 35,000원)', createdAt: new Date().toISOString(), isRead: false },
  { id: '2', type: 'renewal', title: '자동차 보험 갱신 안내', message: '가입하신 다이렉트 자동차보험의 만기가 한 달 남았습니다. 갱신을 준비해주세요.', createdAt: new Date().toISOString(), isRead: true }
];

describe('NotificationList Component', () => {
  it('알림 데이터가 화면에 정상적으로 렌더링되어야 한다.', () => {
    vi.mocked(useNotificationQueries.useGetNotifications).mockReturnValue({ data: mockNotifications } as never);
    vi.mocked(useNotificationQueries.useMarkNotificationRead).mockReturnValue({ mutate: vi.fn() } as never);
    vi.mocked(useNotificationQueries.useDeleteNotification).mockReturnValue({ mutate: vi.fn() } as never);

    render(<NotificationList />);
    
    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('보험료 납입일 안내')).toBeInTheDocument();
    expect(screen.getByText('자동차 보험 갱신 안내')).toBeInTheDocument();
    expect(screen.getByText('1개의 새로운 알림')).toBeInTheDocument();
  });

  it('읽지 않은 알림을 클릭하면 markAsRead가 호출되어야 한다.', () => {
    const mockMarkAsRead = vi.fn();
    vi.mocked(useNotificationQueries.useGetNotifications).mockReturnValue({ data: mockNotifications } as never);
    vi.mocked(useNotificationQueries.useMarkNotificationRead).mockReturnValue({ mutate: mockMarkAsRead } as never);
    vi.mocked(useNotificationQueries.useDeleteNotification).mockReturnValue({ mutate: vi.fn() } as never);

    render(<NotificationList />);
    
    const unreadItem = screen.getByText('보험료 납입일 안내');
    fireEvent.click(unreadItem);
    
    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('데이터가 비어있을 때 Empty State 안내 문구가 올바르게 렌더링되어야 한다.', () => {
    vi.mocked(useNotificationQueries.useGetNotifications).mockReturnValue({ data: [] } as never);
    vi.mocked(useNotificationQueries.useMarkNotificationRead).mockReturnValue({ mutate: vi.fn() } as never);
    vi.mocked(useNotificationQueries.useDeleteNotification).mockReturnValue({ mutate: vi.fn() } as never);

    render(<NotificationList />);
    
    expect(screen.getByText('새로운 알림이 없습니다')).toBeInTheDocument();
  });
});
