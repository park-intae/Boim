import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RightPanel } from './RightPanel';

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
          <RightPanel />
          
        </div>
      </div>
    </div>
  );
}
