import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MainCalendar } from '../components/calendar/MainCalendar';
import fs from 'node:fs';
import path from 'node:path';

// Mock insurance queries and auth hooks
vi.mock('../api/useInsuranceQueries', () => ({
  useGetInsurances: vi.fn(() => ({ data: [] })),
}));

vi.mock('../features/auth/hooks/useLogout', () => ({
  useLogout: () => ({
    logout: vi.fn(),
  }),
}));

describe('SEO & Accessibility (Phase 16-03)', () => {
  it('index.html에 필수 SEO 메타 태그 및 JSON-LD 구조화 데이터가 포함되어야 한다', () => {
    const indexPath = path.resolve(__dirname, '../../index.html');
    const htmlContent = fs.readFileSync(indexPath, 'utf-8');

    // Title & Meta Description
    expect(htmlContent).toContain('<title>Boim - 똑똑한 개인 보험 캘린더</title>');
    expect(htmlContent).toContain('name="description"');

    // PWA & Viewport
    expect(htmlContent).toContain('rel="manifest"');
    expect(htmlContent).toContain('name="viewport"');

    // Open Graph & Twitter Card
    expect(htmlContent).toContain('property="og:title"');
    expect(htmlContent).toContain('name="twitter:card"');

    // JSON-LD Schema.org
    expect(htmlContent).toContain('application/ld+json');
    expect(htmlContent).toContain('"@type": "SoftwareApplication"');
    expect(htmlContent).toContain('"applicationCategory": "FinanceApplication"');
  });

  it('Sidebar의 모든 메뉴 항목이 semantic button이자 접근성 식별자를 가져야 한다', () => {
    render(<Sidebar />);
    const menuNav = screen.getByRole('navigation', { name: '주요 메뉴' });
    expect(menuNav).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(6);

    // 활성 메뉴의 aria-current="page"
    const currentActive = buttons.find((btn) => btn.getAttribute('aria-current') === 'page');
    expect(currentActive).toBeDefined();
    expect(currentActive).toHaveTextContent('보험 일정');
  });

  it('Header의 알림 버튼 및 사용자 메뉴에 WAI-ARIA 팝업/확장 속성이 정의되어 있어야 한다', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const notifBtn = screen.getByRole('button', { name: '알림 목록 보기' });
    expect(notifBtn).toHaveAttribute('aria-haspopup', 'dialog');
    expect(notifBtn).toHaveAttribute('aria-expanded', 'false');

    const profileBtn = screen.getByRole('button', { name: '사용자 메뉴' });
    expect(profileBtn).toHaveAttribute('aria-haspopup', 'menu');
    expect(profileBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('MainCalendar 탐색 컨트롤러에 toolbar 역할 및 aria-label이 부여되어 있어야 한다', () => {
    render(<MainCalendar />);
    const toolbar = screen.getByRole('toolbar', { name: '달력 탐색 컨트롤' });
    expect(toolbar).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '이전 연도' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이전 달' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 달' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 연도' })).toBeInTheDocument();
  });
});
