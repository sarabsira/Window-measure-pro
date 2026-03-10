import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface UIStore {
  isLoading: boolean;
  currentStep: number;
  sidebarOpen: boolean;
  toasts: Toast[];
  setLoading: (loading: boolean) => void;
  setCurrentStep: (step: number) => void;
  setSidebarOpen: (open: boolean) => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isLoading: false,
  currentStep: 0,
  sidebarOpen: true,
  toasts: [],

  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addToast: (message, type) => {
    const id = uuidv4();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
