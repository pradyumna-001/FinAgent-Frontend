import type { DateRange, Density, Toast, ToastAction, ToastType } from '@/types/ui';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface UIState {
    toasts: Toast[];
    addToast: (input: { type: ToastType; message: string; duration?: number; action?: ToastAction }) => void;
    removeToast: (id: string) => void;
    modals: Record<string, boolean>;
    openModal: (name: string) => void;
    closeModal: (name: string) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    density: Density;
    setDensity: (density: Density) => void;
    defaultDateRange: DateRange;
    setDefaultDateRange: (range: DateRange) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            toasts: [],
            addToast: ({ type, message, duration = 5000, action }) => 
                set((state) => ({
                    toasts: [...state.toasts, { id: crypto.randomUUID(), type, message, duration, action }],
                })),
            removeToast: (id) =>
                set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
            modals: {},
            openModal: (name) =>
                set((state) => ({ modals: { ...state.modals, [name]: true } })),
            closeModal: (name) =>
                set((state) => ({ modals: { ...state.modals, [name]: false } })),
            sidebarOpen: false,
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            density: 'comfortable',
            setDensity: (density) => set({ density }),
            defaultDateRange: 'today',
            setDefaultDateRange: (defaultDateRange) => set({ defaultDateRange }),
        }),
        {
            name: 'finagent-ui',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ density: state.density, defaultDateRange: state.defaultDateRange }),
        },
    ),
);

export const useToasts = () => useUIStore((state) => state.toasts);
export const useAddToast = () => useUIStore((state) => state.addToast);
export const useRemoveToast = () => useUIStore((state) => state.removeToast);
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
