import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';
import * as useOnlineStatusModule from '../../hooks/useOnlineStatus';

vi.mock('../../hooks/useOnlineStatus');

describe('OfflineBanner Component', () => {
  it('온라인 상태이고 재연결 상태도 아닐 때는 아무것도 렌더링하지 않아야 한다', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasOffline: false,
      clearReconnected: vi.fn(),
    });

    const { container } = render(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('오프라인 상태일 때 오프라인 경고 배너가 렌더링되어야 한다', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue({
      isOnline: false,
      isOffline: true,
      wasOffline: false,
      clearReconnected: vi.fn(),
    });

    render(<OfflineBanner />);
    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
    expect(screen.getByText(/오프라인 상태/i)).toBeInTheDocument();
  });

  it('재연결 상태일 때 복구 안내 배너가 렌더링되고 닫기 버튼 클릭 시 clearReconnected가 호출되어야 한다', () => {
    const mockClear = vi.fn();
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasOffline: true,
      clearReconnected: mockClear,
    });

    render(<OfflineBanner />);
    expect(screen.getByTestId('reconnected-banner')).toBeInTheDocument();
    expect(screen.getByText(/네트워크 연결이 복구되었습니다/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: '닫기' });
    fireEvent.click(closeBtn);

    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  it('재연결 상태일 때 3.5초 후 자동으로 clearReconnected가 호출되어야 한다', () => {
    vi.useFakeTimers();
    const mockClear = vi.fn();
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasOffline: true,
      clearReconnected: mockClear,
    });

    render(<OfflineBanner />);

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(mockClear).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
