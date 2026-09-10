import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { Toaster } from './Toaster';
import { useUIStore } from '@/stores/uiStore';

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

afterEach(() => {
    vi.useRealTimers();
})

describe('Toaster', () => {
    it('renders toasts', () => {
        useUIStore.getState().addToast({ type: 'success', message: 'Saved' });
        render(<Toaster />);

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    it('auto-dismisses a toast after its duration', () => {
        vi.useFakeTimers();
        useUIStore.getState().addToast({ type: 'info', message: 'ephemeral' });
        render(<Toaster />)

        expect(screen.getByText('ephemeral')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.queryByText('ephemeral')).not.toBeInTheDocument();
        expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('runs the action and dismisses when clicked', async () => {
        const onClick = vi.fn();
        useUIStore.getState().addToast({
            type: 'error',
            message: 'Something failed',
            action: { label: 'Retry', onClick },
        });

        render(<Toaster />);

        await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Something failed')).not.toBeInTheDocument();
        expect(useUIStore.getState().toasts).toHaveLength(0);
    });
});
