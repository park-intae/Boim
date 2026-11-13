import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileBottomNav } from './MobileBottomNav';
import { useAppStore } from '../../store/useAppStore';

describe('MobileBottomNav Component', () => {
  beforeEach(() => {
    useAppStore.setState({ panelMode: 'view' });
  });

  it('4대 핵심 네비게이션 탭이 모두 렌더링되어야 한다', () => {
    render(<MobileBottomNav />);

    expect(screen.getByText('보험 일정')).toBeInTheDocument();
    expect(screen.getByText('내 보험')).toBeInTheDocument();
    expect(screen.getByText('AI 진단')).toBeInTheDocument();
    expect(screen.getByText('설정')).toBeInTheDocument();
  });

  it('초기 상태에서는 보험 일정 탭이 활성화(aria-current="page")되어야 한다', () => {
    render(<MobileBottomNav />);

    const calendarTab = screen.getByRole('button', { name: /보험 일정/ });
    expect(calendarTab).toHaveAttribute('aria-current', 'page');
  });

  it('내 보험 탭 클릭 시 panelMode가 my-insurance로 전환되어야 한다', () => {
    render(<MobileBottomNav />);

    const myInsuranceTab = screen.getByRole('button', { name: /내 보험/ });
    fireEvent.click(myInsuranceTab);

    expect(useAppStore.getState().panelMode).toBe('my-insurance');
  });

  it('AI 진단 탭 클릭 시 panelMode가 ai-diagnosis로 전환되어야 한다', () => {
    render(<MobileBottomNav />);

    const diagnosisTab = screen.getByRole('button', { name: /AI 진단/ });
    fireEvent.click(diagnosisTab);

    expect(useAppStore.getState().panelMode).toBe('ai-diagnosis');
  });

  it('설정 탭 클릭 시 panelMode가 settings로 전환되어야 한다', () => {
    render(<MobileBottomNav />);

    const settingsTab = screen.getByRole('button', { name: /설정/ });
    fireEvent.click(settingsTab);

    expect(useAppStore.getState().panelMode).toBe('settings');
  });
});
