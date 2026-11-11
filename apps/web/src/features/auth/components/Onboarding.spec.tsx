import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Onboarding } from './Onboarding';

describe('Onboarding Component', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial step correctly', () => {
    render(<Onboarding onComplete={mockOnComplete} />);

    expect(screen.getByText('흩어진 내 보험, 한곳에')).toBeInTheDocument();
    expect(screen.getByText(/여러 보험사에 가입된 내역을 한 번에 불러오고/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '건너뛰기' })).toBeInTheDocument();
  });

  it('calls onComplete when 건너뛰기 is clicked', () => {
    render(<Onboarding onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByRole('button', { name: '건너뛰기' }));
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('navigates through steps and completes onboarding', () => {
    render(<Onboarding onComplete={mockOnComplete} />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByText('캘린더로 보는 납입 일정')).toBeInTheDocument();

    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByText('보장 분석부터 맞춤 추천까지')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '시작하기' })).toBeInTheDocument();

    // Step 3 -> Finish
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });
});
