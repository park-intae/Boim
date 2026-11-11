import React from 'react';
import type { DiagnosisGrade } from '@boim/shared-types';

interface DiagnosisScoreCardProps {
  score: number;
  grade: DiagnosisGrade;
  summary: string;
  totalMonthlyPayment: number;
  totalCoverageAmount?: number;
}

const getGradeBadge = (grade: DiagnosisGrade) => {
  switch (grade) {
    case 'EXCELLENT':
      return { text: '매우 우수', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'GOOD':
      return { text: '우수', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'NORMAL':
      return { text: '보통', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'NEEDS_ATTENTION':
      return { text: '점검 필요', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'WARNING':
    default:
      return { text: '보완 시급', bg: 'bg-red-50 text-red-700 border-red-200' };
  }
};

export const DiagnosisScoreCard: React.FC<DiagnosisScoreCardProps> = ({
  score,
  grade,
  summary,
  totalMonthlyPayment,
  totalCoverageAmount = 0,
}) => {
  const gradeInfo = getGradeBadge(grade);

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white border border-indigo-100/70 shadow-sm flex flex-col gap-4 print-avoid-break print:border-gray-200 print:bg-white print:p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[12px] font-bold text-indigo-600 uppercase tracking-wider print:text-gray-700">
            종합 보장 건강 점수
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-[34px] font-black text-gray-900 tracking-tight">{score}</span>
            <span className="text-[16px] font-bold text-gray-400">/ 100점</span>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold ${gradeInfo.bg}`}>
          {gradeInfo.text}
        </div>
      </div>

      {/* 총평 배너 */}
      <div className="p-3.5 rounded-xl bg-white/80 border border-indigo-100/50 backdrop-blur-sm text-[13px] text-gray-700 font-medium leading-relaxed print:bg-gray-50 print:border-gray-200">
        {summary}
      </div>

      {/* 월 납입액 / 총 보장액 칩 */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="p-3 rounded-xl bg-white/90 border border-gray-100 flex flex-col print:bg-gray-50 print:border-gray-200">
          <span className="text-[11px] font-semibold text-gray-400">총 월 납입 보험료</span>
          <span className="text-[15px] font-extrabold text-gray-900 mt-0.5">
            {totalMonthlyPayment.toLocaleString()}원
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white/90 border border-gray-100 flex flex-col print:bg-gray-50 print:border-gray-200">
          <span className="text-[11px] font-semibold text-gray-400">총 보장금액 합계</span>
          <span className="text-[15px] font-extrabold text-gray-900 mt-0.5">
            {totalCoverageAmount.toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  );
};
