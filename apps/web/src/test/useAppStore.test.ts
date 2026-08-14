import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';

describe('useAppStore (Zustand)', () => {
  const initialStoreState = useAppStore.getState();

  beforeEach(() => {
    useAppStore.setState(initialStoreState, true);
  });

  it('기본 상태에서는 오늘 날짜와 view 모드를 가져야 한다.', () => {
    const state = useAppStore.getState();
    expect(state.panelMode).toBe('view');
    expect(state.editingProductId).toBeNull();
    // selectedDate는 기본적으로 Date 객체임
    expect(state.selectedDate).toBeInstanceOf(Date);
  });

  it('setSelectedDate를 호출하면 selectedDate가 변경되어야 한다.', () => {
    const newDate = new Date('2023-01-01');
    useAppStore.getState().setSelectedDate(newDate);
    
    expect(useAppStore.getState().selectedDate).toEqual(newDate);
  });

  it('setPanelMode("form")을 호출하면 form 모드로 변경되어야 한다.', () => {
    useAppStore.getState().setPanelMode('form');
    
    const state = useAppStore.getState();
    expect(state.panelMode).toBe('form');
    expect(state.editingProductId).toBeUndefined(); // setPanelMode로 폼을 열면 새 등록이므로 undefined
  });

  it('setEditingProductId를 호출하면 form 모드로 변경되고 ID가 설정되어야 한다.', () => {
    useAppStore.getState().setEditingProductId(100);
    
    const state = useAppStore.getState();
    expect(state.panelMode).toBe('form');
    expect(state.editingProductId).toBe(100);
  });

  it('setPanelMode("view")를 호출하면 다시 view 모드로 돌아가고 editingProductId가 null이 되어야 한다.', () => {
    useAppStore.getState().setEditingProductId(100); // 폼 모드 설정
    useAppStore.getState().setPanelMode('view');
    
    const state = useAppStore.getState();
    expect(state.panelMode).toBe('view');
    expect(state.editingProductId).toBeNull();
  });

  it('setPanelMode("my-insurance")를 호출하면 my-insurance 모드로 변경되어야 한다.', () => {
    useAppStore.getState().setPanelMode('my-insurance');
    
    const state = useAppStore.getState();
    expect(state.panelMode).toBe('my-insurance');
    expect(state.editingProductId).toBeNull(); // list mode이므로 null
  });
});
