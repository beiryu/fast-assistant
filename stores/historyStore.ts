import { create } from 'zustand';
import { Translation } from '@/lib/types';

interface HistoryState {
  translations: Translation[];
  searchQuery: string;
  isLoading: boolean;
  setTranslations: (translations: Translation[]) => void;
  addTranslation: (translation: Translation) => void;
  removeTranslation: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  translations: [],
  searchQuery: '',
  isLoading: false,
  setTranslations: (translations) => set({ translations }),
  addTranslation: (translation) => set((state) => ({
    translations: [translation, ...state.translations],
  })),
  removeTranslation: (id) => set((state) => ({
    translations: state.translations.filter((t) => t.id !== id),
  })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearHistory: () => set({ translations: [], searchQuery: '' }),
}));

