import { ChevronRight } from 'lucide-react';
import { useSuspenseQuery } from '@tanstack/react-query';

const fetchSummaryMock = async () => {
  return new Promise((resolve) => setTimeout(() => resolve({
    totalCount: 7,
    paymentCount: 3,
    renewalCount: 2,
    expirationCount: 1,
  }), 500));
};

export function SummaryCard() {
  const { data } = useSuspenseQuery({
    queryKey: ['insurance', 'summary'],
    queryFn: fetchSummaryMock,
  });

  return (
    <div className="bg-white rounded-[20px] p-5 border border-brand-gray-100 shadow-sm flex flex-col h-[170px]">
      <h2 className="text-[15px] font-bold text-brand-gray-900 mb-4">내 보험 요약</h2>
      
      <div className="flex flex-col gap-[14px]">
        <div className="flex justify-between items-center">
          <span className="text-brand-gray-600 text-[13px] tracking-tight">가입 보험</span>
          <span className="text-brand-gray-900 text-[15px] font-bold">{data.totalCount}개</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-brand-gray-600 text-[13px] tracking-tight">이번 달 납입</span>
          <span className="text-brand-gray-900 text-[15px] font-bold">{data.paymentCount}건</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-brand-gray-600 text-[13px] tracking-tight">갱신 예정</span>
          <span className="text-status-warning-text text-[15px] font-bold">{data.renewalCount}건</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-brand-gray-600 text-[13px] tracking-tight">만기 예정</span>
          <span className="text-status-warning-text text-[15px] font-bold">{data.expirationCount}건</span>
        </div>
      </div>
    </div>
  );
}
