import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { Toaster } from './components/ui/toaster/Toaster';
import { router } from './router';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';

vi.mock('@/api/auth', () => ({
    login: vi.fn(),
    getMe: vi.fn(),
}));

import { getMe } from '@/api/auth';

const renderApp = () =>
    render(
        <QueryClientProvider client={new QueryClient()}>
            <AuthProvider>
                <ThemeProvider>
                    <RouterProvider router={router} />
                    <Toaster />
                </ThemeProvider>
            </AuthProvider>
        </QueryClientProvider>
    );

beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    useAuthStore.setState({ accessToken: null, manager: null, isLoading: false });
    useUIStore.setState({
        toasts: [],
        modals: {},
        sidebarOpen: false,
        density: 'comfortable',
        defaultDateRange: 'today',
    });
    vi.clearAllMocks();
    (getMe as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, name: 'P', email: 'a@b.co' });
});

describe('App', () => {
    it('renders without errors', async () => {
        renderApp();
        expect(screen.getByRole('heading', { name: 'FinAgent' })).toBeInTheDocument();
        await waitFor(() => expect(getMe).toHaveBeenCalled());
    });

    it('calls checkAuth on mount', async () => {
        renderApp();
        await waitFor(() => expect(getMe).toHaveBeenCalled());
    });

    it('renders a toast when added', async () => {
        useUIStore.getState().addToast({ type: 'success', message: 'Saved' });
        renderApp();
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Saved')).toBeInTheDocument();
        await waitFor(() => expect(getMe).toHaveBeenCalled());
    });
});
