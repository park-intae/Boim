import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolicyViewer } from './PolicyViewer';

describe('PolicyViewer Component', () => {
  const mockOnBack = vi.fn();

  it('renders terms of service correctly', () => {
    render(<PolicyViewer type="terms" onBack={mockOnBack} />);

    expect(screen.getByText('이용약관')).toBeInTheDocument();
    expect(screen.getByText(/본 약관은 Boim 서비스의 이용과 관련하여/)).toBeInTheDocument();
  });

  it('renders privacy policy correctly', () => {
    render(<PolicyViewer type="privacy" onBack={mockOnBack} />);

    expect(screen.getByText('개인정보처리방침')).toBeInTheDocument();
    expect(screen.getByText(/Boim은 다음의 목적을 위하여 개인정보를 처리합니다/)).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<PolicyViewer type="terms" onBack={mockOnBack} />);

    const backBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(backBtn);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
