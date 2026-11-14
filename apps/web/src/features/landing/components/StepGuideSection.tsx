import React, { useState } from 'react';
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Calendar,
  Check,
  AlertCircle,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

/**
 * 💡 랜딩 페이지 이용 방법(Step Guide) 3단계 섹션
 * 비로그인 방문자 대상 단계별 기능 체험 및 시각적 이해를 돕기 위한 인터랙티브 쇼케이스 목업을 포함합니다.
 * (실제 로그인 사용자의 데이터 계층과는 명확히 분리된 온보딩 쇼케이스 전용 UI입니다.)
 */
export const StepGuideSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  return (
    <section id="step-guide" className="scroll-mt-20 py-20 lg:py-28 bg-slate-50/50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Step by Step Guide Description (Interactive Tabs) */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="text-[13px] font-extrabold text-blue-600 tracking-wider uppercase mb-3">
              A CLEARER VIEW
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight mb-4">
              복잡한 보험 정보도<br />
              보기 쉽게 정리됩니다.
            </h2>
            <p className="text-base text-gray-600 font-medium leading-relaxed mb-8">
              보험 등록부터 보장 분석까지, 필요한 정보를 단계별로 투명하게 확인하세요.
            </p>

            {/* Interactive Step Items */}
            <div className="space-y-4 w-full" role="tablist" aria-label="이용 방법 단계">
              
              {/* Step 1 Button */}
              <button
                type="button"
                role="tab"
                aria-selected={activeStep === 1}
                onClick={() => setActiveStep(1)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-start gap-4 border ${
                  activeStep === 1
                    ? 'bg-white border-blue-200 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10'
                    : 'bg-transparent border-transparent hover:bg-white/60 hover:border-gray-200/60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 transition-colors ${
                    activeStep === 1
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  1
                </div>
                <div>
                  <h3 className={`text-base font-bold mb-1 transition-colors ${
                    activeStep === 1 ? 'text-blue-900 font-black' : 'text-gray-800'
                  }`}>
                    보험 정보를 간편하게 등록하고
                  </h3>
                  <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                    보험 증권 사진 한 장으로 보험사, 상품명, 납입 금액을 자동 추출합니다.
                  </p>
                </div>
              </button>

              {/* Step 2 Button */}
              <button
                type="button"
                role="tab"
                aria-selected={activeStep === 2}
                onClick={() => setActiveStep(2)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-start gap-4 border ${
                  activeStep === 2
                    ? 'bg-white border-blue-200 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10'
                    : 'bg-transparent border-transparent hover:bg-white/60 hover:border-gray-200/60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 transition-colors ${
                    activeStep === 2
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  2
                </div>
                <div>
                  <h3 className={`text-base font-bold mb-1 transition-colors ${
                    activeStep === 2 ? 'text-blue-900 font-black' : 'text-gray-800'
                  }`}>
                    납입 일정과 일정을 캘린더로 정리하고
                  </h3>
                  <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                    월 납입액, 자동이체일, 만기일을 캘린더와 D-Day 알림으로 꼼꼼히 챙깁니다.
                  </p>
                </div>
              </button>

              {/* Step 3 Button */}
              <button
                type="button"
                role="tab"
                aria-selected={activeStep === 3}
                onClick={() => setActiveStep(3)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-start gap-4 border ${
                  activeStep === 3
                    ? 'bg-white border-blue-200 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10'
                    : 'bg-transparent border-transparent hover:bg-white/60 hover:border-gray-200/60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 transition-colors ${
                    activeStep === 3
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  3
                </div>
                <div>
                  <h3 className={`text-base font-bold mb-1 transition-colors ${
                    activeStep === 3 ? 'text-blue-900 font-black' : 'text-gray-800'
                  }`}>
                    내 보험 상태를 AI로 한눈에 확인하세요
                  </h3>
                  <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                    Gemini AI가 내 연령대에 꼭 맞는 필수 보장 대비 과다/부족 항목을 리포트합니다.
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Right Column: Step-specific Interactive Mockup Panel */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/60 border border-gray-100 min-h-[460px] flex flex-col justify-between">
              
              {/* STEP 1: Registration Mockup */}
              {activeStep === 1 && (
                <div key="step-1" className="animate-[fadeIn_0.3s_ease-in-out]">
                  {/* Form Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-0.5">보험 등록</h3>
                      <p className="text-[12px] font-medium text-gray-400">증권을 업로드하거나 직접 정보를 입력하세요.</p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/50 text-[11px] font-bold text-indigo-700">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>증권 자동 완성</span>
                    </div>
                  </div>

                  {/* Document Uploader Mockup */}
                  <div className="mb-4 rounded-2xl border-2 border-dashed border-indigo-200/80 bg-indigo-50/30 p-4 text-center">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                      <UploadCloud className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="text-[12px] font-bold text-gray-800 mb-1">
                      증권 PDF 또는 이미지를 드래그하여 업로드
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium mb-2.5">
                      PDF, JPG, PNG 파일 지원 (최대 10MB)
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold shadow-sm shadow-indigo-500/20">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                      <span>가상 모의 증권 샘플로 원클릭 분석</span>
                    </div>

                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>3초 만에 폼 정보가 자동 입력되었습니다</span>
                    </div>
                  </div>

                  {/* Pre-filled Form Fields */}
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 mb-1">보험사</div>
                        <div className="w-full h-8 px-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center text-[12px] font-bold text-gray-900">
                          OO손해보험
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 mb-1">월 납입액</div>
                        <div className="w-full h-8 px-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center text-[12px] font-bold text-blue-600">
                          85,000원
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-gray-400 mb-1">상품명</div>
                      <div className="w-full h-8 px-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center text-[12px] font-semibold text-gray-900">
                        OO 맞춤 종합보장보험 (표준형)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Calendar & Schedule Mockup */}
              {activeStep === 2 && (
                <div key="step-2" className="animate-[fadeIn_0.3s_ease-in-out]">
                  {/* Schedule Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-0.5">납입 및 일정 관리</h3>
                      <p className="text-[12px] font-medium text-gray-400">이번 달 캘린더 납입 일정을 자동으로 모아봅니다.</p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/50 text-[11px] font-bold text-blue-700">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span>2026. 11</span>
                    </div>
                  </div>

                  {/* Monthly Summary Badge */}
                  <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-500">이번 달 총 납입 예정</div>
                        <div className="text-[16px] font-black text-gray-950">257,000<span className="text-[12px] font-bold text-gray-500">원</span></div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                      정상 납입 중
                    </span>
                  </div>

                  {/* Timeline Schedule Items */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-extrabold">
                          15일
                        </span>
                        <div>
                          <div className="text-[12px] font-bold text-gray-900">OO 종합건강보험</div>
                          <div className="text-[11px] text-gray-400 font-medium">85,000원 · 자동이체</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        D-2 알림
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-extrabold">
                          22일
                        </span>
                        <div>
                          <div className="text-[12px] font-bold text-gray-900">OO 안심 운전자보험</div>
                          <div className="text-[11px] text-gray-400 font-medium">52,000원 · 카드납</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        완료
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-[11px] font-extrabold">
                          28일
                        </span>
                        <div>
                          <div className="text-[12px] font-bold text-gray-900">OO 든든 실손보험</div>
                          <div className="text-[11px] text-gray-400 font-medium">120,000원 · 자동이체</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        예정
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: AI Diagnosis Report Mockup */}
              {activeStep === 3 && (
                <div key="step-3" className="animate-[fadeIn_0.3s_ease-in-out]">
                  {/* Diagnosis Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-0.5">AI 보장 종합 진단</h3>
                      <p className="text-[12px] font-medium text-gray-400">Gemini AI가 내 보장의 균형을 분석했습니다.</p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/50 text-[11px] font-bold text-emerald-700">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      <span>안심 등급 🟢</span>
                    </div>
                  </div>

                  {/* Big Score Card */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-4 mb-4 shadow-lg shadow-blue-500/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-blue-100">내 보장 종합 점수</span>
                      <span className="text-[11px] font-extrabold text-blue-200">상위 15%</span>
                    </div>
                    <div className="text-3xl font-black tracking-tight mb-2">
                      85 <span className="text-base font-semibold text-blue-200">/ 100점</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-white rounded-full" />
                    </div>
                  </div>

                  {/* Coverage Breakdown */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50 border border-gray-100">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>3대 질병 진단비 (암·뇌·심장)</span>
                      </div>
                      <span className="font-extrabold text-blue-600">100% 충족</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50 border border-gray-100">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>실손의료비 보장</span>
                      </div>
                      <span className="font-extrabold text-blue-600">가입 완료</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50 border border-gray-100">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>치아 / 일상 간병 특약</span>
                      </div>
                      <span className="font-extrabold text-amber-600">보강 추천</span>
                    </div>
                  </div>

                  {/* Gemini AI Advice Summary */}
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 font-medium leading-relaxed">
                    💡 <strong>AI 총평:</strong> 30대 필수 보장이 매우 탄탄합니다. 치아 관련 소액 특약만 검토하시면 완벽합니다.
                  </div>
                </div>
              )}

              {/* Bottom Card Footer Action Indicator */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400">
                <span>단계별 Boim 실제 기능 목업</span>
                <span className="text-blue-600">{activeStep} / 3 단계 진행 중</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
