import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from './useOnlineStatus';

describe('useOnlineStatus hook', () => {
  const originalOnLine = navigator.onLine;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      configurable: true,
      writable: true,
    });
  });

  it('기본적으로 온라인 상태일 때 isOnline이 true여야 한다', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
    });

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
    expect(result.current.wasOffline).toBe(false);
  });

  it('offline 이벤트 발생 시 isOffline이 true로 전환되어야 한다', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('오프라인 상태에서 다시 online 이벤트 발생 시 wasOffline이 true가 되어야 한다', () => {
    const { result } = renderHook(() => useOnlineStatus());

    // 1. 오프라인으로 전환
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOffline).toBe(true);

    // 2. 다시 온라인 복구
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(true);

    // 3. 알림 초기화
    act(() => {
      result.current.clearReconnected();
    });
    expect(result.current.wasOffline).toBe(false);
  });
});
