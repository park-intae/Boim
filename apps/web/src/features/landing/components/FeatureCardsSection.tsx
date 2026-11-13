import React from 'react';
import { Plus, Bell, ShieldCheck, Check } from 'lucide-react';

export const FeatureCardsSection: React.FC = () => {
  return (
    <section id="features" className="scroll-mt-20 py-20 lg:py-28 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-[13px] font-extrabold text-blue-600 tracking-wider uppercase mb-3">
            WHAT YOU CAN DO
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight mb-4">
            보험 관리에 필요한 모든 것,<br />
            한곳에서 간편하게.
          </h2>
          <p className="text-base text-gray-600 font-medium leading-relaxed">
            보임은 보험 정보를 모으고, 중요한 일정을 챙기고, 보장 상태를 살펴볼 수 있도록 돕습니다.
          </p>
        </div>

        {/* 3 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: 통합 관리 */}
          <div className="bg-slate-50/70 hover:bg-white rounded-3xl p-7 border border-gray-100 hover:border-blue-200 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between group cursor-default">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2.5">
                내 보험 한눈에 관리
              </h3>
              <p className="text-[14px] text-gray-600 font-medium leading-relaxed mb-8">
                여러 보험사에 흩어진 가입 정보를 한 화면에서 일괄 확인하고 손쉽게 관리하세요.
              </p>
            </div>

            {/* Inner UI Preview */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/60 shadow-sm group-hover:border-blue-100 transition-colors">
              <div className="text-[11px] font-bold text-gray-400 mb-1">나의 보험 현황</div>
              <div className="flex items-center justify-between">
                <div className="text-[18px] font-extrabold text-gray-950">
                  7<span className="text-[13px] font-bold text-gray-500">개 가입 보험</span>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 rounded-lg">
                  전체 보기
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: 일정 알림 */}
          <div className="bg-slate-50/70 hover:bg-white rounded-3xl p-7 border border-gray-100 hover:border-blue-200 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between group cursor-default">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Bell className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2.5">
                납입·갱신 일정 알림
              </h3>
              <p className="text-[14px] text-gray-600 font-medium leading-relaxed mb-8">
                보험료 납입일과 갱신·만기일을 달력과 알림으로 꼼꼼히 챙겨 연체를 방지하세요.
              </p>
            </div>

            {/* Inner UI Preview */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/60 shadow-sm group-hover:border-emerald-100 transition-colors">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                보험료 납입 알림
              </div>
              <div className="text-[13px] font-extrabold text-gray-900 mb-1">
                OO 종합건강보험 · 85,000원
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>납입 완료</span>
              </div>
            </div>
          </div>

          {/* Card 3: AI 보장 상태 분석 (Boim 실스펙 업그레이드) */}
          <div className="bg-slate-50/70 hover:bg-white rounded-3xl p-7 border border-gray-100 hover:border-blue-200 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between group cursor-default">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2.5">
                AI 보장 상태 분석
              </h3>
              <p className="text-[14px] text-gray-600 font-medium leading-relaxed mb-8">
                Gemini AI 기반으로 연령대별 권장 보장 대비 과다/부족 항목을 정밀 진단합니다.
              </p>
            </div>

            {/* Inner UI Preview */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/60 shadow-sm group-hover:border-amber-100 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-1.5">
                <span>AI 종합 보장 점수</span>
                <span className="text-emerald-600 font-extrabold">안심 등급 🟢</span>
              </div>
              <div className="text-[18px] font-black text-blue-600 mb-2">
                85 <span className="text-[12px] font-bold text-gray-400">/ 100점</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-[85%]" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
