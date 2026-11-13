import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { BrandLogo } from '../../../components/common/BrandLogo';

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navbarOffset = 72;
      const elementTop = el.getBoundingClientRect().top;
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const targetPosition = Math.max(0, elementTop + currentScrollY - navbarOffset);

      try {
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      } catch {
        window.scrollTo(0, targetPosition);
      }
    }
  };

  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch {
      window.scrollTo(0, 0);
    }
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
            onClick={() => scrollToSection('intro')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            서비스 소개
          </button>
          <button 
            type="button" 
            onClick={() => scrollToSection('features')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            주요 기능
          </button>
          <button 
            type="button" 
            onClick={() => scrollToSection('step-guide')}
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
