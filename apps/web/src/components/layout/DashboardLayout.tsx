import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative border-r border-gray-200 bg-white shadow-[0_0_20px_rgba(0,0,0,0.02)] z-10 overflow-auto">
        <Outlet />
      </main>
      <RightSidebar />
    </div>
  );
}
