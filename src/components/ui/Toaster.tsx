import { useUIStore } from "@/stores/uiStore";

export function Toaster() {
    const toasts = useUIStore((state) => state.toasts);
    const removeToast = useUIStore((state) => state.removeToast);

    if (toasts.length == 0) {
        return null;
    }

    return (
        <div role='status' aria-live="polite" className="toaster">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast--${toast.type}`}>
                    <span>{toast.message}</span>
                    <button type="button" onClick={() => removeToast(toast.id)}>
                        Dismiss
                    </button>
                </div>
            ))}
        </div>
    );
}
