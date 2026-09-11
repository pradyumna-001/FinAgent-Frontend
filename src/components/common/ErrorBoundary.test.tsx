import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';
import { log } from '@/services/errorService';

vi.mock('@/services/errorService', () => ({
    log: vi.fn(),
    handleAsyncError: vi.fn(),
}));

function Bomb(): never {
    throw new Error('render boom');
}

const originalLocation = window.location;

beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...originalLocation, reload: vi.fn() },
    });
});

afterEach(() => {
    Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
    });
    vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
    it('renders the fallback when a child throws', () => {
        render(<ErrorBoundary><Bomb /></ErrorBoundary>);

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Refresh Page' })).toBeInTheDocument();
    });

    it('logs the error with component stack', () => {
        render(<ErrorBoundary><Bomb /></ErrorBoundary>);

        const logMock = log as ReturnType<typeof vi.fn>;
        expect(logMock).toHaveBeenCalled();
        expect(logMock.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(logMock.mock.calls[0][1]).toBeTypeOf('string');
    });

    it('uses a custom fallback when provided', () => {
        render(<ErrorBoundary fallback={<p>Custom fallback</p>}><Bomb /></ErrorBoundary>);

        expect(screen.getByText('Custom fallback')).toBeInTheDocument();
        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('reloads the page when Refresh is clicked', async () => {
        render(<ErrorBoundary><Bomb /></ErrorBoundary>);

        await userEvent.click(screen.getByRole('button', { name: 'Refresh Page' }));

        expect(window.location.reload).toHaveBeenCalled();
    });
});
