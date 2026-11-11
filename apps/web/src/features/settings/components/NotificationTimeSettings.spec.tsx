import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationTimeSettings } from './NotificationTimeSettings';
import * as userQueries from '../../../api/useUserQueries';

vi.mock('../../../api/useUserQueries', () => ({
  useGetNotificationSettings: vi.fn(),
  useUpdateNotificationSettings: vi.fn(),
}));

describe('NotificationTimeSettings Component', () => {
  const mockOnBack = vi.fn();
  const mockUpdateSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userQueries.useUpdateNotificationSettings).mockReturnValue({
      mutate: mockUpdateSettings,
    } as unknown as ReturnType<typeof userQueries.useUpdateNotificationSettings>);
  });

  it('renders time inputs when quiet hours are enabled', () => {
    vi.mocked(userQueries.useGetNotificationSettings).mockReturnValue({
      data: {
        pushEnabled: true,
        emailEnabled: true,
        kakaoEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      },
    } as unknown as ReturnType<typeof userQueries.useGetNotificationSettings>);

    render(<NotificationTimeSettings onBack={mockOnBack} />);

    expect(screen.getByText('방해 금지 시간 설정')).toBeInTheDocument();
    expect(screen.getByText('시작 시간')).toBeInTheDocument();
    expect(screen.getByText('종료 시간')).toBeInTheDocument();
    expect(screen.getByDisplayValue('22:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08:00')).toBeInTheDocument();
  });

  it('toggles quiet hours to disabled when clicked', () => {
    vi.mocked(userQueries.useGetNotificationSettings).mockReturnValue({
      data: {
        pushEnabled: true,
        emailEnabled: true,
        kakaoEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      },
    } as unknown as ReturnType<typeof userQueries.useGetNotificationSettings>);

    const { container } = render(<NotificationTimeSettings onBack={mockOnBack} />);

    const toggle = container.querySelector('.cursor-pointer');
    expect(toggle).toBeInTheDocument();

    if (toggle) {
      fireEvent.click(toggle);
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        quietHoursStart: null,
        quietHoursEnd: null,
      });
    }
  });

  it('toggles quiet hours to enabled when currently disabled', () => {
    vi.mocked(userQueries.useGetNotificationSettings).mockReturnValue({
      data: {
        pushEnabled: true,
        emailEnabled: true,
        kakaoEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
      },
    } as unknown as ReturnType<typeof userQueries.useGetNotificationSettings>);

    const { container } = render(<NotificationTimeSettings onBack={mockOnBack} />);

    expect(screen.queryByText('시작 시간')).not.toBeInTheDocument();

    const toggle = container.querySelector('.cursor-pointer');
    expect(toggle).toBeInTheDocument();
    if (toggle) {
      fireEvent.click(toggle);
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      });
    }
  });

  it('updates time when start time is changed', () => {
    vi.mocked(userQueries.useGetNotificationSettings).mockReturnValue({
      data: {
        pushEnabled: true,
        emailEnabled: true,
        kakaoEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      },
    } as unknown as ReturnType<typeof userQueries.useGetNotificationSettings>);

    render(<NotificationTimeSettings onBack={mockOnBack} />);

    const startInput = screen.getByDisplayValue('22:00');
    fireEvent.change(startInput, { target: { value: '23:30' } });

    expect(mockUpdateSettings).toHaveBeenCalledWith({ quietHoursStart: '23:30' });
  });

  it('calls onBack when back button is clicked', () => {
    vi.mocked(userQueries.useGetNotificationSettings).mockReturnValue({
      data: {
        pushEnabled: true,
        emailEnabled: true,
        kakaoEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
      },
    } as unknown as ReturnType<typeof userQueries.useGetNotificationSettings>);

    render(<NotificationTimeSettings onBack={mockOnBack} />);
    const backBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(backBtn);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
