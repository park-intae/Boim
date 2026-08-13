import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { Bell, ChevronDown } from 'lucide-react';

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-[#F8FAFF] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col h-full overflow-hidden" style={{ width: '900px', marginLeft: '47px' }}>
        {/* Top Header */}
        <header className="h-[135px] shrink-0 flex items-center justify-between pt-[40px]">
          <h1 className="text-[19px] font-bold text-brand-gray-900">보험 일정</h1>
          <div className="flex items-center gap-4 text-brand-gray-700">
            <Bell className="w-5 h-5 text-brand-gray-500" />
            <div className="flex items-center gap-1 bg-brand-50 px-4 py-2 rounded-full cursor-pointer">
              <span className="text-[14px] font-medium text-brand-gray-900">박인태님</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-auto pr-[80px]">
          <Outlet />
        </main>
      </div>
      <RightSidebar />
    </div>
  );
}
