import { Suspense } from 'react';
import { UpcomingEvents } from './UpcomingEvents';
import { ErrorBoundary } from 'react-error-boundary';

export function RightSidebar() {
  return (
    <aside className="w-[380px] shrink-0 h-full flex flex-col pt-[135px] pr-[82px] overflow-y-auto scrollbar-hide">
      <ErrorBoundary fallback={<div className="p-4 bg-red-50 text-red-500 rounded-2xl">일정 정보를 불러오는데 실패했습니다.</div>}>
        <Suspense fallback={<div className="h-[400px] bg-gray-100 animate-pulse rounded-2xl" />}>
          <UpcomingEvents />
        </Suspense>
      </ErrorBoundary>
    </aside>
  );
}
