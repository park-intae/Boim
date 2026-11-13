import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { BrandLogo } from '../../../components/common/BrandLogo';

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const animationFrameRef = React.useRef<number | null>(null);

  // 브라우저 CSS scroll-behavior와 충돌 없이 100% 부드러운 슬라이드를 보장하는 스크롤러
  const smoothScrollTo = (targetY: number, duration = 650) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const docEl = document.documentElement;
    const body = document.body;

    // CSS의 scroll-behavior: smooth와 JS 프레임 루프 충돌로 인한 캔슬/점프 방지
    const prevDocBehavior = docEl.style.scrollBehavior;
    const prevBodyBehavior = body.style.scrollBehavior;
    docEl.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    const startY = window.pageYOffset || docEl.scrollTop || body.scrollTop || 0;
    const diff = targetY - startY;

    if (Math.abs(diff) < 2) {
      docEl.style.scrollBehavior = prevDocBehavior;
      body.style.scrollBehavior = prevBodyBehavior;
      return;
    }

    let startTime: number | null = null;

    // 부드러운 감속 가속도 3차 베지어 곡선 (easeInOutCubic)
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = duration <= 0 ? 1 : Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);
      const currentPos = Math.round(startY + diff * ease);

      window.scrollTo(0, currentPos);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetY);
        docEl.style.scrollBehavior = prevDocBehavior;
        body.style.scrollBehavior = prevBodyBehavior;
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const navbarOffset = 72;
    const rect = el.getBoundingClientRect();
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const targetPosition = Math.max(0, rect.top + currentScrollY - navbarOffset);

    smoothScrollTo(targetPosition, 650);
  };

  const scrollToTop = () => {
    smoothScrollTo(0, 500);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={scrollToTop}
          className="cursor-pointer group select-none"
          role="button"
          tabIndex={0}
          aria-label="최상단으로 이동"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              scrollToTop();
            }
          }}
        >
          <BrandLogo size="md" symbolClassName="group-hover:scale-105" />
        </div>

        {/* Center Nav Links (Design Spec: 서비스 소개 -> 주요 기능 -> 이용 방법) */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-gray-600">
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('intro');
            }}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            서비스 소개
          </button>
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('features');
            }}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            주요 기능
          </button>
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('step-guide');
            }}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            이용 방법
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-[14px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-full shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              대시보드로 이동
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-3.5 py-1.5 text-[14px] font-semibold text-gray-700 hover:text-gray-950 hover:bg-gray-100/80 active:scale-95 rounded-full transition-all cursor-pointer"
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="px-4 py-2 text-[14px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-full shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                무료로 시작하기
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
