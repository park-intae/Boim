import { create } from 'zustand';

interface AppState {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  panelMode: 'view' | 'form' | 'my-insurance' | 'analysis' | 'notifications' | 'settings';
  setPanelMode: (mode: 'view' | 'form' | 'my-insurance' | 'analysis' | 'notifications' | 'settings') => void;
  // 수정 모드일 때 선택된 상품 ID를 저장 (생성일 때는 null)
  editingProductId: number | bigint | null;
  setEditingProductId: (id: number | bigint | null) => void;
  // 모바일에서 우측 패널(바텀 시트) 열림 상태
  isMobilePanelOpen: boolean;
  setIsMobilePanelOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  panelMode: 'view',
  setPanelMode: (mode) => set({ 
    panelMode: mode, 
    editingProductId: mode === 'view' || mode === 'my-insurance' || mode === 'analysis' || mode === 'notifications' || mode === 'settings' ? null : undefined,
    isMobilePanelOpen: true // 모드가 변경될 때 모바일 패널을 자동으로 엶
  }),
  editingProductId: null,
  setEditingProductId: (id) => set({ editingProductId: id, panelMode: 'form', isMobilePanelOpen: true }),
  isMobilePanelOpen: false,
  setIsMobilePanelOpen: (isOpen) => set({ isMobilePanelOpen: isOpen }),
}));
