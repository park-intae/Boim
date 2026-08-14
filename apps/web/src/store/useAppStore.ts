import { create } from 'zustand';

interface AppState {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  panelMode: 'view' | 'form' | 'my-insurance' | 'analysis';
  setPanelMode: (mode: 'view' | 'form' | 'my-insurance' | 'analysis') => void;
  // 수정 모드일 때 선택된 상품 ID를 저장 (생성일 때는 null)
  editingProductId: number | bigint | null;
  setEditingProductId: (id: number | bigint | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  panelMode: 'view',
  setPanelMode: (mode) => set({ panelMode: mode, editingProductId: mode === 'view' || mode === 'my-insurance' || mode === 'analysis' ? null : undefined }),
  editingProductId: null,
  setEditingProductId: (id) => set({ editingProductId: id, panelMode: 'form' }),
}));
