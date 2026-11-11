import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmailNotificationItem } from './EmailNotificationItem';

describe('EmailNotificationItem Component', () => {
  it('이메일 알림 제목과 설명이 올바르게 렌더링되어야 한다', () => {
    render(<EmailNotificationItem enabled={true} onToggle={vi.fn()} />);

    expect(screen.getByText('이메일 알림')).toBeDefined();
    expect(screen.getByText('납입일 및 만기 도래 시 이메일 수신')).toBeDefined();
  });

  it('토글 스위치 클릭 시 onToggle 콜백이 호출되어야 한다', () => {
    const handleToggle = vi.fn();
    render(<EmailNotificationItem enabled={false} onToggle={handleToggle} />);

    const toggleBtn = screen.getByRole('switch', { name: '이메일 알림 토글' });
    expect(toggleBtn.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태일 때는 클릭해도 onToggle이 호출되지 않아야 한다', () => {
    const handleToggle = vi.fn();
    render(<EmailNotificationItem enabled={true} onToggle={handleToggle} disabled={true} />);

    const toggleBtn = screen.getByRole('switch', { name: '이메일 알림 토글' });
    expect(toggleBtn).toBeDisabled();

    fireEvent.click(toggleBtn);
    expect(handleToggle).not.toHaveBeenCalled();
  });
});
