import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationList } from '../components/layout/NotificationList';
import * as useNotificationQueries from '../api/useNotificationQueries';

// Mock the hooks
vi.mock('../api/useNotificationQueries', () => ({
  useGetNotifications: vi.fn(),
  useMarkNotificationRead: vi.fn(),
  useMarkAllNotificationsRead: vi.fn(),
  useDeleteNotification: vi.fn(),
  useTriggerBatch: vi.fn(),
}));

const mockNotifications = [
  {
    id: '1',
    type: 'payment',
    title: '보험료 납입일 안내',
    message: '내일은 (무)무배당 실손의료보험의 납입일입니다. (예상 금액: 35,000원)',
    createdAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: '2',
    type: 'renewal',
    title: '자동차 보험 갱신 안내',
    message: '가입하신 다이렉트 자동차보험의 만기가 한 달 남았습니다. 갱신을 준비해주세요.',
    createdAt: new Date().toISOString(),
    isRead: true,
  },
];

describe('NotificationList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotificationQueries.useMarkAllNotificationsRead).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useNotificationQueries.useTriggerBatch).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  it('알림 데이터가 화면에 정상적으로 렌더링되어야 한다.', () => {
    vi.mocked(useNotificationQueries.useGetNotifications).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
    } as never);
    vi.mocked(useNotificationQueries.useMarkNotificationRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);
    vi.mocked(useNotificationQueries.useDeleteNotification).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    render(<NotificationList />);

    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('보험료 납입일 안내')).toBeInTheDocument();
    expect(screen.getByText('자동차 보험 갱신 안내')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('읽지 않은 알림을 클릭하면 markAsRead가 호출되어야 한다.', () => {
    const mockMarkAsRead = vi.fn();
    vi.mocked(useNotificationQueries.useGetNotifications).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
    } as never);
    vi.mocked(useNotificationQueries.useMarkNotificationRead).mockReturnValue({
      mutate: mockMarkAsRead,
    } as never);
    vi.mocked(useNotificationQueries.useDeleteNotification).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    render(<NotificationList />);

    const unreadItem = screen.getByText('보험료 납입일 안내');
    fireEvent.click(unreadItem);

    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('모두 읽음 버튼을 클릭하면 markAllAsRead가 호출되어야 한다.', () => {
    const mockMarkAll = vi.fn();
    vi.mocked(useNotificationQueries.useGetNotifications).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
    } as never);
    vi.mocked(useNotificationQueries.useMarkNotificationRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);
    vi.mocked(useNotificationQueries.useMarkAllNotificationsRead).mockReturnValue({
      mutate: mockMarkAll,
      isPending: false,
    } as never);
    vi.mocked(useNotificationQueries.useDeleteNotification).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    render(<NotificationList />);

    const markAllButton = screen.getByText('모두 읽음');
    fireEvent.click(markAllButton);

    expect(mockMarkAll).toHaveBeenCalled();
  });

  it('알림 새로고침(동기화) 버튼을 클릭하면 triggerBatch가 호출되어야 한다.', () => {
    const mockTriggerBatch = vi.fn();
    vi.mocked(useNotificationQueries.useGetNotifications).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
    } as never);
    vi.mocked(useNotificationQueries.useTriggerBatch).mockReturnValue({
      mutate: mockTriggerBatch,
      isPending: false,
    } as never);

    render(<NotificationList />);

    const refreshButton = screen.getByTitle('스케줄러 알림 즉시 동기화');
    fireEvent.click(refreshButton);

    expect(mockTriggerBatch).toHaveBeenCalled();
  });

  it('데이터가 비어있을 때 Empty State 안내 문구가 올바르게 렌더링되어야 한다.', () => {
    vi.mocked(useNotificationQueries.useGetNotifications).mockReturnValue({
      data: [],
      isLoading: false,
    } as never);
    vi.mocked(useNotificationQueries.useMarkNotificationRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);
    vi.mocked(useNotificationQueries.useDeleteNotification).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    render(<NotificationList />);

    expect(screen.getByText('새로운 알림이 없습니다')).toBeInTheDocument();
  });

  it('알림 제거(X) 버튼을 클릭하면 deleteNotification이 호출되어야 한다.', () => {
    const mockDelete = vi.fn();
    vi.mocked(useNotificationQueries.useGetNotifications).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
    } as never);
    vi.mocked(useNotificationQueries.useMarkNotificationRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);
    vi.mocked(useNotificationQueries.useDeleteNotification).mockReturnValue({
      mutate: mockDelete,
    } as never);

    render(<NotificationList />);

    const removeButtons = screen.getAllByRole('button', { name: '알림 제거' });
    fireEvent.click(removeButtons[0]);

    expect(mockDelete).toHaveBeenCalledWith('1');
  });

  it('다양한 시간대의 알림 날짜 형식을 정상적으로 렌더링해야 한다.', () => {
    const variedNotifications = [
      {
        id: '10',
        type: 'info',
        title: '5분 전 알림',
        message: '테스트 메시지',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isRead: false,
      },
      {
        id: '11',
        type: 'info',
        title: '3시간 전 알림',
        message: '테스트 메시지',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        isRead: true,
      },
      {
        id: '12',
        type: 'info',
        title: '2일 전 알림',
        message: '테스트 메시지',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
      },
    ];

    vi.mocked(useNotificationQueries.useGetNotifications).mockReturnValue({
      data: variedNotifications,
      isLoading: false,
    } as never);
    vi.mocked(useNotificationQueries.useMarkNotificationRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);
    vi.mocked(useNotificationQueries.useDeleteNotification).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    render(<NotificationList />);

    expect(screen.getByText('5분 전')).toBeInTheDocument();
    expect(screen.getByText('3시간 전')).toBeInTheDocument();
    expect(screen.getByText('2일 전')).toBeInTheDocument();
  });
});
