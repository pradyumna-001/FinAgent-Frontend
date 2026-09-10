import { describe, expect, it, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

beforeEach(() => {
    localStorage.clear();
    useUIStore.setState({
        toasts: [],
        modals: {},
        sidebarOpen: false,
        density: 'comfortable',
        defaultDateRange: 'today',
    });
});

describe('uiStore', () => {
    it('adds and removes toasts', () => {
        useUIStore.getState().addToast({ type: 'success', message: 'Saved' });
        expect(useUIStore.getState().toasts).toHaveLength(1);
        expect(useUIStore.getState().toasts[0].message).toBe('Saved');
        expect(useUIStore.getState().toasts[0].duration).toBe(5000);
        expect(useUIStore.getState().toasts[0].id).toEqual(expect.any(String));

        const id = useUIStore.getState().toasts[0].id;
        useUIStore.getState().removeToast(id);
        expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('opens and closes modals', () => {
        useUIStore.getState().openModal('feedback');
        expect(useUIStore.getState().modals).toEqual({ feedback: true });

        useUIStore.getState().closeModal('feedback');
        expect(useUIStore.getState().modals).toEqual({ feedback: false });
    });

    it('toggles the sidebar', () => {
        useUIStore.getState().setSidebarOpen(true);
        expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('persists only density and defaultDateRange', () => {
        useUIStore.getState().setDensity('compact');
        useUIStore.getState().setDefaultDateRange('week');
        useUIStore.getState().addToast({ type: 'info', message: 'secret' });
        useUIStore.getState().setSidebarOpen(true);

        const persisted = JSON.parse(localStorage.getItem('finagent-ui')!);
        expect(persisted.state).toEqual({ density: 'compact', defaultDateRange: 'week' });
    });
});
