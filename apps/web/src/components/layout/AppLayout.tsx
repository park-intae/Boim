import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans">
      {/* 1. Left Sidebar (Fixed) */}
      <Sidebar />
      
      {/* 2. Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Top Header (Spans remaining width) */}
        <Header />
        
        {/* Content Split (Center + Right) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Center Column: Main Routing Area */}
          <main className="flex-1 overflow-auto px-10 pb-12">
            <Outlet />
          </main>
          
          {/* Right Column: Off-canvas or side panel */}
          <aside className="w-[380px] flex-shrink-0 pr-10 pb-12 overflow-y-auto">
            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-3xl flex items-center justify-center text-gray-400 font-medium bg-gray-50/50">
              우측 패널 영역 (8월 12일 상세)
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}
