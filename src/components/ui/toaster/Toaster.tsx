import { useEffect } from 'react';
import { useRemoveToast, useToasts } from '@/stores/uiStore';
import type { Toast } from '@/types/ui';

function ToastItem({ toast }: { toast: Toast }) {
    const removeToast = useRemoveToast();
    const action = toast.action;

    const handleAction = () => {
        if (action) {
            action.onClick();
        }
        removeToast(toast.id);
    };

    useEffect(() => {
        const timer = setTimeout(() => removeToast(toast.id), toast.duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, removeToast]);

    return (
        <div role="alert">
            <span>{toast.message}</span>
            {action && (
                <button type="button" onClick={handleAction}>
                    {action.label}
                </button>
            )}
        </div>
    );
}

export function Toaster() {
    const toasts = useToasts();

    return (
        <div aria-live="polite">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
}
