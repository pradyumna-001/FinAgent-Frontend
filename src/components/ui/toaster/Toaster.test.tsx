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

        expect(screen.getByRole('status')).toBeInTheDocument();
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

    it('uses role=alert for errors and role=status for others', () => {
        useUIStore.getState().addToast({ type: 'error', message: 'Boom' });
        useUIStore.getState().addToast({ type: 'info', message: 'FYI' });
        render(<Toaster />);

        expect(screen.getByRole('alert')).toHaveTextContent('Boom');
        expect(screen.getByRole('status')).toHaveTextContent('FYI');
    });

    it('close button dismisses without firing the action', async () => {
        const onClick = vi.fn();
        useUIStore.getState().addToast({ type: 'warning', message: 'Heads up', action: { label: 'Undo', onClick } });
        render(<Toaster />);

        await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));

        expect(onClick).not.toHaveBeenCalled();
        expect(screen.queryByText('Heads up')).not.toBeInTheDocument();
    });

    it('does not auto-dismiss when duration is 0', () => {
        vi.useFakeTimers();
        useUIStore.getState().addToast({ type: 'error', message: 'sticky', duration: 0 });
        render(<Toaster />);

        act(() => {
            vi.advanceTimersByTime(30000);
        });

        expect(screen.getByText('sticky')).toBeInTheDocument();
    });

    it('applies the semantic color class per type', () => {
        useUIStore.getState().addToast({ type: 'warning', message: 'Careful' });
        render(<Toaster />);

        expect(screen.getByText('Careful').closest('div')).toHaveClass('bg-amber-100');
    });
});
