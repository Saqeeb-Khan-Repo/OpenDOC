import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Toast } from '@/types';

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = uuidv4();
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) =>
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  success: (title, description) =>
    get().addToast({ type: 'success', title, description }),

  error: (title, description) =>
    get().addToast({ type: 'error', title, description }),

  info: (title, description) =>
    get().addToast({ type: 'info', title, description }),

  warning: (title, description) =>
    get().addToast({ type: 'warning', title, description }),
}));
