import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CtaBannerSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0b1329] px-6 py-14 sm:px-12 sm:py-16 text-center text-white shadow-2xl">
          
          {/* Subtle Geometric Circle Background Art (SVG) */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/20 blur-2xl pointer-events-none" />
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-blue-500/20 pointer-events-none hidden sm:block" />
          <div className="absolute right-20 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-blue-500/10 pointer-events-none hidden sm:block" />

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block text-[12px] font-extrabold uppercase tracking-widest text-blue-400 mb-4">
              START WITH BOIM
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-tight mb-4 text-white">
              내 보험 관리, 이제 보임에서.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 font-medium mb-8">
              나의 보험 현황을 정리하고 중요한 일정을 챙겨보세요.
            </p>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-gray-950 hover:bg-slate-100 active:scale-95 text-[15px] font-extrabold shadow-lg shadow-black/20 transition-all cursor-pointer"
            >
              <span>무료로 시작하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
