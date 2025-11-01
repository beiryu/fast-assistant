import { create } from 'zustand';
import { Translation } from '@/lib/types';

interface TranslationState {
  currentInput: string;
  currentOutput: string;
  isLoading: boolean;
  error: string | null;
  setInput: (input: string) => void;
  setOutput: (output: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTranslationStore = create<TranslationState>((set) => ({
  currentInput: '',
  currentOutput: '',
  isLoading: false,
  error: null,
  setInput: (input) => set({ currentInput: input, error: null }),
  setOutput: (output) => set({ currentOutput: output }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ 
    currentInput: '', 
    currentOutput: '', 
    isLoading: false, 
    error: null 
  }),
}));

