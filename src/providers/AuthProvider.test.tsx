import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

vi.mock('@/api/auth', () => ({
    login: vi.fn(),
    getMe: vi.fn(),
}));

import { login as apiLogin, getMe as apiGetMe } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';


function Harness() {
    const { login, logout, checkAuth, isLoading } = useAuth();
    return (
        <div>
            <span>loading:{String(isLoading)}</span>
            <button onClick={() => login('a@b.co', 'pw')}>login</button>
            <button onClick={() => logout()}>logout</button>
            <button onClick={() => checkAuth()}>checkAuth</button>
        </div>
    );
}

const renderHarness = () =>
    render(
        <AuthProvider>
            <Harness />
        </AuthProvider>
    );

beforeEach(() => {
    sessionStorage.clear();
    useAuthStore.setState({ accessToken: null, manager: null, isLoading: false });
    vi.clearAllMocks();
})

describe('AuthProvider', () => {
    
    it('logs in and stores token + manager', async () => {
        (apiLogin as ReturnType<typeof vi.fn>).mockResolvedValue({
            access_token: 'tok',
            manager: { id: 1, name: 'P', email: 'a@b.co' },
        });
        renderHarness();
        fireEvent.click(screen.getByText('login'));
        await screen.findByText('loading:false');
        expect(useAuthStore.getState().accessToken).toBe('tok');
        expect(useAuthStore.getState().manager?.name).toBe('P');
    });


    it('logout clears token + manager', () => {
        useAuthStore.setState({ accessToken: 'tok', manager: { id: 1, name: 'P', email: 'a@b.co' } });
        renderHarness();
        fireEvent.click(screen.getByText('logout'));
        expect(useAuthStore.getState().accessToken).toBeNull();
        expect(useAuthStore.getState().manager).toBeNull();
    });


    it('checkAuth stores manager on success (valid token)', async () => {
        (apiGetMe as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, name: 'P', email: 'a@b.co' });
        renderHarness();
        fireEvent.click(screen.getByText('checkAuth'));
        await waitFor(() => {
            expect(useAuthStore.getState().manager).toEqual({ id: 1, name: 'P', email: 'a@b.co' });
        });
    });
    
    it('calls checkAuth (getMe) on mount', async () => {
        (apiGetMe as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, name: 'P', email: 'a@b.co' });
        renderHarness();
        await waitFor(() => {
            expect(useAuthStore.getState().manager).toEqual({ id: 1, name: 'P', email: 'a@b.co' });
        });
        expect(apiGetMe).toHaveBeenCalled();
    });
});
