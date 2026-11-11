import React from 'react';
import type { CategoryEvaluation, CoverageStatus } from '@boim/shared-types';

interface CoverageProgressListProps {
  evaluations: CategoryEvaluation[];
}

const getStatusBadge = (status: CoverageStatus) => {
  switch (status) {
    case 'ADEQUATE':
      return { text: '적정', bg: 'bg-emerald-100 text-emerald-800' };
    case 'OVER_COVERED':
      return { text: '과다', bg: 'bg-purple-100 text-purple-800' };
    case 'UNDER_COVERED':
      return { text: '부족', bg: 'bg-amber-100 text-amber-800' };
    case 'NOT_COVERED':
    default:
      return { text: '미가입', bg: 'bg-rose-100 text-rose-800' };
  }
};

export const CoverageProgressList: React.FC<CoverageProgressListProps> = ({ evaluations }) => {
  return (
    <div className="flex flex-col gap-3 print-avoid-break">
      <div className="flex items-center justify-between">
        <h4 className="text-[14px] font-bold text-gray-900">카테고리별 보장 적정도</h4>
        <span className="text-[11px] text-gray-400 font-medium">3040 표준 권장 기준</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {evaluations.map((item) => {
          const badge = getStatusBadge(item.status);
          const percent =
            item.recommendedAmount > 0
              ? Math.min(100, Math.round((item.currentAmount / item.recommendedAmount) * 100))
              : 0;

          return (
            <div
              key={item.category}
              className="p-4 rounded-xl bg-gray-50/70 border border-gray-100/70 flex flex-col gap-2 print:border-gray-200 print:bg-white print-avoid-break"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-gray-800">{item.category}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badge.bg}`}>
                    {badge.text}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-gray-500">
                  {item.currentAmount > 0
                    ? `${(item.currentAmount / 10000).toLocaleString()}만원`
                    : '0원'}
                  <span className="text-gray-400 font-normal">
                    {' '}
                    / {(item.recommendedAmount / 10000).toLocaleString()}만원
                  </span>
                </span>
              </div>

              {/* 비교 프로그레스 바 */}
              <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    item.status === 'ADEQUATE'
                      ? 'bg-emerald-500'
                      : item.status === 'OVER_COVERED'
                      ? 'bg-purple-500'
                      : item.status === 'UNDER_COVERED'
                      ? 'bg-amber-500'
                      : 'bg-rose-400'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p className="text-[12px] text-gray-500 leading-relaxed mt-0.5">{item.comment}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
