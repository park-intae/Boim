import type { FC } from 'react';
import { CalendarDays, ShieldCheck, Sparkles, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const MobileBottomNav: FC = () => {
  const panelMode = useAppStore((state) => state.panelMode);
  const setPanelMode = useAppStore((state) => state.setPanelMode);

  const activeKey =
    panelMode === 'my-insurance'
      ? 'my-insurance'
      : panelMode === 'ai-diagnosis'
      ? 'ai-diagnosis'
      : panelMode === 'settings'
      ? 'settings'
      : 'calendar';

  const navItems = [
    {
      key: 'calendar',
      label: '보험 일정',
      icon: CalendarDays,
      onClick: () => setPanelMode('view'),
    },
    {
      key: 'my-insurance',
      label: '내 보험',
      icon: ShieldCheck,
      onClick: () => setPanelMode('my-insurance'),
    },
    {
      key: 'ai-diagnosis',
      label: 'AI 진단',
      icon: Sparkles,
      onClick: () => setPanelMode('ai-diagnosis'),
    },
    {
      key: 'settings',
      label: '설정',
      icon: Settings,
      onClick: () => setPanelMode('settings'),
    },
  ];

  return (
    <nav
      aria-label="모바일 하단 네비게이션"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.key;

          return (
            <button
              type="button"
              key={item.key}
              onClick={item.onClick}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-indigo-600 font-bold'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              <div
                className={`w-9 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-50' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
