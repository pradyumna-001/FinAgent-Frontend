import { create } from 'zustand';

type ToastType = 'error' | 'success' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastState {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: number) => void;
}

let nextId = 0;

export const useUIStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (type, message, duration) => {
        const id = nextId++;
        set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
        if (duration) {
            setTimeout(() => {
                set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
            }, duration);
        }
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
