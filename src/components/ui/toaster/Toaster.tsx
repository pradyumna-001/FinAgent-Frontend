import { useEffect } from 'react';
import { useRemoveToast, useToasts } from '@/stores/uiStore';
import type { Toast, ToastType } from '@/types/ui';

const TYPE_CLASSES: Record<ToastType, string> = {
    error: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-100 text-blue-800',
};

function ToastItem({ toast }: { toast: Toast }) {
    const removeToast = useRemoveToast();
    const action = toast.action;
    const role = toast.type === 'error' ? 'alert' : 'status';

    const handleAction = () => {
        if (action) {
            action.onClick();
        }
        removeToast(toast.id);
    };

    useEffect(() => {
        if (toast.duration === 0) {
            return;
        }
        const timer = setTimeout(() => removeToast(toast.id), toast.duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, removeToast]);

    return (
        <div role={role} className={`flex items-center gap-2 rounded-md px-3 py-2 shadow ${TYPE_CLASSES[toast.type]}`}>
            <span>{toast.message}</span>
            {action && (
                <button type="button" onClick={handleAction}>
                    {action.label}
                </button>
            )}
            <button type="button" aria-label="Dismiss notification" onClick={() => removeToast(toast.id)}>×</button>
        </div>
    );
}

export function Toaster() {
    const toasts = useToasts();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
}
