import React, { useEffect } from 'react';
import { LandingNavbar } from './components/LandingNavbar';
import { HeroSection } from './components/HeroSection';
import { FeatureCardsSection } from './components/FeatureCardsSection';
import { StepGuideSection } from './components/StepGuideSection';
import { CtaBannerSection } from './components/CtaBannerSection';
import { LandingFooter } from './components/LandingFooter';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    // 랜딩 페이지 접근 시 SEO 타이틀 갱신
    document.title = 'Boim - 흩어진 내 보험, 한눈에 보임 | 스마트 보험 캘린더 & AI 진단';
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <LandingNavbar />

      {/* 2. Hero Section with Interactive Mockup */}
      <main className="flex-1">
        <HeroSection />

        {/* 3. 3-Column Core Features Section */}
        <FeatureCardsSection />

        {/* 4. Step-by-Step Guide & OCR Form Section */}
        <StepGuideSection />

        {/* 5. Start with Boim Dark CTA Banner */}
        <CtaBannerSection />
      </main>

      {/* 6. Minimal Footer */}
      <LandingFooter />
    </div>
  );
};
