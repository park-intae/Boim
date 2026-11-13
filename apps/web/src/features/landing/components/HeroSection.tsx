import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { BrandLogo } from '../../../components/common/BrandLogo';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="intro" className="scroll-mt-20 relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-blue-50/40 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Head Copy & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-[12px] font-bold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              나를 위한 스마트 보험 관리
            </div>

            {/* Main H1 Headline for SEO */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-gray-950 tracking-tight leading-[1.18] mb-6">
              흩어진 내 보험,<br />
              <span className="text-blue-600">한눈에 보임.</span>
            </h1>

            {/* Sub description */}
            <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-8 max-w-xl">
              가입한 보험부터 매달 나가는 납입 일정과 부족한 보장까지.<br className="hidden sm:inline" />
              복잡했던 보험 관리를 보임에서 간편하게 시작하세요.
            </p>

            {/* Action CTA Group */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-7 py-3.5 text-[15px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>내 보험 관리 시작</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[13px] font-semibold text-gray-400 self-center sm:self-auto">
                복잡한 절차 없이 간편하게
              </span>
            </div>

            {/* Bullet Highlights */}
            <div className="flex flex-wrap items-center gap-6 text-[13px] font-bold text-gray-700 pt-2 border-t border-gray-100 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>보험 현황 통합 관리</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>납입·갱신 일정 알림</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Gemini AI 보장 진단</span>
              </div>
            </div>

            <p className="text-[12px] text-gray-400 font-medium mt-4">
              보험을 더 명확하게 관리하는 새로운 금융 습관
            </p>
          </div>

          {/* Right Column: Interactive Real Mockup Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl shadow-blue-900/10 border border-gray-100/90 relative">
              {/* Inner Mockup Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-3.5">
                <BrandLogo size="sm" />
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-gray-500">김보임 님</span>
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-extrabold">김</div>
                </div>
              </div>

              {/* Title inside card */}
              <div className="mb-3">
                <h3 className="text-[15px] font-extrabold text-gray-900">보험 일정</h3>
                <p className="text-[11px] font-medium text-gray-400">이번 달 보험 흐름을 확인해 보세요.</p>
              </div>

              {/* Metric Cards (4 Grid) */}
              <div className="grid grid-cols-4 gap-1.5 mb-4">
                <div className="bg-slate-50 rounded-xl p-2 text-center border border-gray-100/80">
                  <div className="text-[10px] font-semibold text-gray-500">가입 보험</div>
                  <div className="text-[14px] font-black text-gray-900 mt-0.5">7<span className="text-[10px] font-bold text-gray-400">건</span></div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 text-center border border-gray-100/80">
                  <div className="text-[10px] font-semibold text-gray-500">이번 달 납입</div>
                  <div className="text-[14px] font-black text-blue-600 mt-0.5">3<span className="text-[10px] font-bold text-gray-400">건</span></div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 text-center border border-gray-100/80">
                  <div className="text-[10px] font-semibold text-gray-500">갱신 예정</div>
                  <div className="text-[14px] font-black text-amber-600 mt-0.5">2<span className="text-[10px] font-bold text-gray-400">건</span></div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 text-center border border-gray-100/80">
                  <div className="text-[10px] font-semibold text-gray-500">만기 예정</div>
                  <div className="text-[14px] font-black text-indigo-600 mt-0.5">1<span className="text-[10px] font-bold text-gray-400">건</span></div>
                </div>
              </div>

              {/* Calendar Visual */}
              <div className="bg-slate-50/70 rounded-2xl p-3 border border-gray-100 mb-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-extrabold text-gray-900">2026년 11월</span>
                  <div className="flex gap-1 text-[10px] font-bold text-gray-400">
                    <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span>
                  </div>
                </div>
                {/* Mini Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-700 py-1">
                  <span className="text-red-500 text-[10px]">일</span>
                  <span className="text-[10px]">월</span>
                  <span className="text-[10px]">화</span>
                  <span className="text-[10px]">수</span>
                  <span className="text-[10px]">목</span>
                  <span className="text-[10px]">금</span>
                  <span className="text-blue-500 text-[10px]">토</span>
                  
                  <span className="text-gray-300">1</span>
                  <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
                  <span className="text-red-500">8</span>
                  <span>9</span>
                  <span className="relative">
                    10
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                  </span>
                  <span>11</span>
                  {/* Today (12th) */}
                  <span className="w-5 h-5 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm shadow-blue-500/30">
                    12
                  </span>
                  <span>13</span><span>14</span>
                  <span className="text-red-500">15</span>
                  <span>16</span><span>17</span><span>18</span><span>19</span>
                  <span className="relative">
                    20
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full" />
                  </span>
                  <span>21</span>
                </div>
              </div>

              {/* Today Schedule List */}
              <div className="bg-white rounded-2xl p-3 border border-gray-100/90 shadow-sm">
                <div className="text-[11px] font-extrabold text-gray-900 mb-2">오늘의 일정</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="font-bold text-gray-800">OO 종합건강보험</span>
                    </div>
                    <span className="font-extrabold text-blue-600">85,000원 납입</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="font-bold text-gray-800">OO 안심 운전자보험</span>
                    </div>
                    <span className="font-bold text-gray-500">11월 20일 갱신 예정</span>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-100 flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => navigate('/signup')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>일정 전체 보기</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
