import { type FC, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RightPanel } from './RightPanel';
import { OfflineBanner } from '../common/OfflineBanner';
import { MobileBottomNav } from './MobileBottomNav';

export interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white print:block">
      <OfflineBanner />

      <div className="flex flex-1 min-h-0 overflow-hidden print:block">
        <div className="print:hidden">
          <Sidebar />
        </div>
        
        <div className="flex flex-col flex-1 min-w-0 h-full print:h-auto print:overflow-visible print:block">
          <div className="print:hidden">
            <Header />
          </div>
          
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden print:h-auto print:overflow-visible print:block">
            <main className="flex-1 overflow-auto px-4 lg:px-10 pb-20 lg:pb-12 print:hidden">
              {children ?? <Outlet />}
            </main>
            
            <RightPanel />
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
};
