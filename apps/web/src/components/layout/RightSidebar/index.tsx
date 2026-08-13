import { UserProfile } from './UserProfile';
import { SummaryCard } from './SummaryCard';
import { UpcomingEvents } from './UpcomingEvents';

export function RightSidebar() {
  return (
    <aside className="w-80 bg-gray-50 h-screen flex flex-col border-l border-gray-200 shrink-0">
      <UserProfile />
      <div className="flex-1 p-6 overflow-y-auto">
        <SummaryCard title="요약 정보" amount={0} />
        <UpcomingEvents />
      </div>
    </aside>
  );
}
