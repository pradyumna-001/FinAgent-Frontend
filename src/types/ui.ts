export type ToastType = 'error' | 'success' | 'info';

export interface ToastAction {
    label: string;
    onClick: () => void;
}

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration: number;
    action?: ToastAction;
}

export type Density = 'compact' | 'comfortable';

export type DateRange = 'today' | 'week' | 'month';

