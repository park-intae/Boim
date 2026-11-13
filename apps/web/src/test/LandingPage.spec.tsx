import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LandingPage } from '../features/landing/LandingPage';
import { useAuthStore } from '../features/auth/store/authStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LandingPage Component (Phase 17)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it('랜딩 페이지의 핵심 SEO 헤드라인과 주요 가치 제안이 렌더링되어야 한다', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // H1 Headline
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/흩어진 내 보험/i);
    expect(screen.getByText(/한눈에 보임\./i)).toBeInTheDocument();

    // Key subtext
    expect(screen.getByText(/가입한 보험부터 매달 나가는 납입 일정과 부족한 보장까지/i)).toBeInTheDocument();
  });

  it('GNB에 통일된 BrandLogo 및 비로그인 상태의 로그인/무료 시작하기 버튼이 노출되고 클릭 시 이동해야 한다', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const loginBtn = screen.getByRole('button', { name: '로그인' });
    const signupBtns = screen.getAllByRole('button', { name: '무료로 시작하기' });

    expect(loginBtn).toBeInTheDocument();
    expect(signupBtns[0]).toBeInTheDocument();

    fireEvent.click(loginBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    fireEvent.click(signupBtns[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('GNB 네비게이션 메뉴(서비스 소개, 주요 기능, 이용 방법) 클릭 시 스크롤 이동이 정상 트리거되어야 한다', () => {
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;
    let callCount = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      callCount++;
      if (callCount === 1) {
        cb(0);
      } else if (callCount === 2) {
        cb(1000);
      }
      return 1;
    });

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const introBtn = screen.getByRole('button', { name: '서비스 소개' });
    const featuresBtn = screen.getByRole('button', { name: '주요 기능' });
    const stepGuideBtn = screen.getByRole('button', { name: '이용 방법' });

    expect(introBtn).toBeInTheDocument();
    expect(featuresBtn).toBeInTheDocument();
    expect(stepGuideBtn).toBeInTheDocument();

    // mock getBoundingClientRect for target sections
    const featuresEl = document.getElementById('features');
    if (featuresEl) {
      vi.spyOn(featuresEl, 'getBoundingClientRect').mockReturnValue({
        top: 500,
        bottom: 1000,
        left: 0,
        right: 800,
        width: 800,
        height: 500,
        x: 0,
        y: 500,
        toJSON: () => {},
      });
    }

    fireEvent.click(featuresBtn);
    expect(scrollToMock).toHaveBeenCalled();
  });

  it('로그인 상태인 경우 GNB에 대시보드로 이동 버튼이 노출되어야 한다', () => {
    useAuthStore.getState().login(
      { id: '1', email: 'user@boim.com', isPassVerified: true },
      'mock_token'
    );

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const dashboardBtn = screen.getByRole('button', { name: '대시보드로 이동' });
    expect(dashboardBtn).toBeInTheDocument();

    fireEvent.click(dashboardBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('3대 핵심 기능 카드(통합 관리, 일정 알림, AI 보장 분석)가 정상적으로 렌더링되어야 한다', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('WHAT YOU CAN DO')).toBeInTheDocument();
    expect(screen.getByText('내 보험 한눈에 관리')).toBeInTheDocument();
    expect(screen.getAllByText('납입·갱신 일정 알림').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('AI 보장 상태 분석')).toBeInTheDocument();
    expect(screen.getByText(/AI 종합 보장 점수/i)).toBeInTheDocument();
    expect(screen.getAllByText(/안심 등급 🟢/i).length).toBeGreaterThanOrEqual(1);
  });

  it('단계별 가이드(StepGuideSection) 인터랙티브 탭 전환(1->2->3단계)이 정상 동작해야 한다', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('A CLEARER VIEW')).toBeInTheDocument();
    
    // 1단계 기본 노출 확인
    expect(screen.getByText('보험 정보를 간편하게 등록하고')).toBeInTheDocument();
    expect(screen.getByText('증권 자동 완성')).toBeInTheDocument();
    expect(screen.getByText(/가상 모의 증권 샘플로 원클릭 분석/i)).toBeInTheDocument();
    expect(screen.getByText(/3초 만에 폼 정보가 자동 입력되었습니다/i)).toBeInTheDocument();
    expect(screen.getByText('1 / 3 단계 진행 중')).toBeInTheDocument();

    // 2단계 클릭 전환
    const step2Tab = screen.getByRole('tab', { name: /납입 일정과 일정을 캘린더로 정리하고/i });
    fireEvent.click(step2Tab);

    expect(screen.getByText('납입 및 일정 관리')).toBeInTheDocument();
    expect(screen.getByText('257,000')).toBeInTheDocument();
    expect(screen.getByText('2 / 3 단계 진행 중')).toBeInTheDocument();

    // 3단계 클릭 전환
    const step3Tab = screen.getByRole('tab', { name: /내 보험 상태를 AI로 한눈에 확인하세요/i });
    fireEvent.click(step3Tab);

    expect(screen.getByText('AI 보장 종합 진단')).toBeInTheDocument();
    expect(screen.getByText('내 보장 종합 점수')).toBeInTheDocument();
    expect(screen.getByText('3 / 3 단계 진행 중')).toBeInTheDocument();
  });

  it('하단 최종 CTA 배너가 렌더링되고 시작 버튼 클릭 시 /signup으로 이동해야 한다', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('START WITH BOIM')).toBeInTheDocument();
    expect(screen.getByText('내 보험 관리, 이제 보임에서.')).toBeInTheDocument();

    // Multiple "무료로 시작하기" buttons exist (Navbar & CTA Banner)
    const ctaBtns = screen.getAllByRole('button', { name: /무료로 시작하기/i });
    expect(ctaBtns.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(ctaBtns[ctaBtns.length - 1]);
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });
});
