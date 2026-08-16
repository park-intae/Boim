import React, { useState } from 'react';
import { ShieldCheck, CalendarDays, TrendingUp } from 'lucide-react';

const onboardingSteps = [
  {
    icon: <ShieldCheck className="w-12 h-12 text-blue-500" />,
    title: '흩어진 내 보험, 한곳에',
    description: '여러 보험사에 가입된 내역을 한 번에 불러오고 한눈에 확인하세요.',
  },
  {
    icon: <CalendarDays className="w-12 h-12 text-blue-500" />,
    title: '캘린더로 보는 납입 일정',
    description: '이번 달은 얼마를 내야 할까? 캘린더에서 직관적으로 일정을 관리하세요.',
  },
  {
    icon: <TrendingUp className="w-12 h-12 text-blue-500" />,
    title: '보장 분석부터 맞춤 추천까지',
    description: '나에게 부족한 보장이 무엇인지 분석하고 합리적으로 설계해보세요.',
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-6 bg-slate-50">
      {/* 상단 건너뛰기 버튼 */}
      <div className="w-full flex justify-end pt-4">
        <button 
          onClick={onComplete}
          className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          건너뛰기
        </button>
      </div>

      {/* 중앙 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm text-center">
        <div className="mb-8 p-6 bg-blue-50 rounded-full">
          {onboardingSteps[currentStep].icon}
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-4 transition-all">
          {onboardingSteps[currentStep].title}
        </h1>
        
        <p className="text-slate-600 leading-relaxed min-h-[4rem]">
          {onboardingSteps[currentStep].description}
        </p>
      </div>

      {/* 하단 인디케이터 및 버튼 */}
      <div className="w-full max-w-sm pb-8 space-y-8">
        <div className="flex justify-center space-x-2">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? 'w-6 bg-blue-500' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors active:scale-[0.98]"
        >
          {currentStep === onboardingSteps.length - 1 ? '시작하기' : '다음'}
        </button>
      </div>
    </div>
  );
};
