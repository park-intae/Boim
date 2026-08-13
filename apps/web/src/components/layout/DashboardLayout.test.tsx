import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardLayout } from './DashboardLayout';
import { BrowserRouter } from 'react-router-dom';

// lucide-react 아이콘 모킹 (테스트 속도 및 에러 방지)
vi.mock('lucide-react', () => ({
  Home: () => <div data-testid="icon-home" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  ShieldAlert: () => <div data-testid="icon-shield" />,
  FileText: () => <div data-testid="icon-file" />,
  Settings: () => <div data-testid="icon-settings" />,
  Bell: () => <div data-testid="icon-bell" />,
  User: () => <div data-testid="icon-user" />
}));

describe('DashboardLayout', () => {
  it('Sidebar와 Topbar 컴포넌트가 렌더링되어야 한다', () => {
    render(
      <BrowserRouter>
        <DashboardLayout />
      </BrowserRouter>
    );

    expect(screen.getByText('Boim')).toBeInTheDocument();
    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(screen.getByText('보험 캘린더')).toBeInTheDocument();
    
    expect(screen.getByText(/환영합니다, 사용자님/i)).toBeInTheDocument();
  });
});
