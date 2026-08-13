import { ChevronRight } from 'lucide-react';
import { useSuspenseQuery } from '@tanstack/react-query';

// TODO: API 연동 시 별도 features/ 훅으로 분리 예정
const fetchSummaryMock = async () => {
  return new Promise((resolve) => setTimeout(() => resolve({
    totalCount: 7,
    paymentCount: 3,
    renewalCount: 2,
    expirationCount: 1,
  }), 500));
};

export function SummaryCard() {
  // TanStack Query + Suspense 적용
  const { data } = useSuspenseQuery({
    queryKey: ['insurance', 'summary'],
    queryFn: fetchSummaryMock,
  });

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-5">
      <h2 className="text-[17px] font-bold text-gray-900">내 보험 요약</h2>
      
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm font-medium">가입 보험</span>
          <span className="text-gray-900 font-bold">{data.totalCount}개</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm font-medium">이번 달 납입</span>
          <span className="text-gray-900 font-bold">{data.paymentCount}건</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm font-medium">갱신 예정</span>
          <span className="text-gray-900 font-bold text-amber-600">{data.renewalCount}건</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm font-medium">만기 예정</span>
          <span className="text-gray-900 font-bold text-red-500">{data.expirationCount}건</span>
        </div>
      </div>

      <div className="pt-2">
        <button className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group">
          내 보험 전체 보기
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
