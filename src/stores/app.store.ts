import { create } from 'zustand';

/**
 * 순수 UI 상태만 담는 스토어. DB 데이터 캐시로 쓰지 않는다 —
 * 건강 기록의 source of truth는 SQLite다.
 */
type AppState = {
  selectedPetId: string | null;
  setSelectedPetId: (id: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedPetId: null,
  setSelectedPetId: (id) => set({ selectedPetId: id }),
}));
