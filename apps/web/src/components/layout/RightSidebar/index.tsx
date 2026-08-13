import { Suspense } from 'react';
import { SummaryCard } from './SummaryCard';
import { UpcomingEvents } from './UpcomingEvents';
import { ErrorBoundary } from 'react-error-boundary';

export function RightSidebar() {
  return (
    <aside className="w-[360px] shrink-0 h-full flex flex-col gap-6 overflow-y-auto pl-2 py-2 pr-4 scrollbar-hide">
      <ErrorBoundary fallback={<div className="p-4 bg-red-50 text-red-500 rounded-2xl">요약 정보를 불러오는데 실패했습니다.</div>}>
        <Suspense fallback={<div className="h-[280px] bg-gray-100 animate-pulse rounded-2xl" />}>
          <SummaryCard />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<div className="p-4 bg-red-50 text-red-500 rounded-2xl">일정 정보를 불러오는데 실패했습니다.</div>}>
        <Suspense fallback={<div className="h-[400px] bg-gray-100 animate-pulse rounded-2xl" />}>
          <UpcomingEvents />
        </Suspense>
      </ErrorBoundary>
    </aside>
  );
}
