import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { client } from './client';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

vi.mock('@/router', () => ({
    router: { navigate: vi.fn() },
}));

import { router } from '@/router';

function httpError(config: InternalAxiosRequestConfig, status: number, data: unknown): AxiosError {
    const response = { data, status, statusText: 'error', headers: {}, config } as unknown as AxiosResponse;
    return new AxiosError('Request failed', undefined, config, undefined, response);
}

function networkError(config: InternalAxiosRequestConfig): AxiosError {
    return new AxiosError('Network Error', undefined, config);
}

beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    useAuthStore.setState({ accessToken: null, manager: null, isLoading: false });
    useUIStore.setState({ toasts: [], modals: {}, sidebarOpen: false, density: 'comfortable', defaultDateRange: 'today' });
    client.defaults.adapter = async (config) => ({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
});

describe('client request interceptor', () => {
    it('attaches the Bearer header when a token exists', async () => {
        let captured: InternalAxiosRequestConfig | undefined;
        useAuthStore.setState({ accessToken: 'tok' });
        client.defaults.adapter = async (config) => {
            captured = config;
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
        };

        await client.get('/auth/me');

        expect(captured?.headers.Authorization).toBe('Bearer tok');
    });

    it('omits the Bearer header when no token exists', async () => {
        let captured: InternalAxiosRequestConfig | undefined;
        client.defaults.adapter = async (config) => {
            captured = config;
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
        };

        await client.get('/auth/me');

        expect(captured?.headers.Authorization).toBeUndefined();
    });
});

describe('client response interceptor', () => {
    it('logs out and redirects on 401 (non-login)', async () => {
        useAuthStore.setState({ accessToken: 'tok' });
        client.defaults.adapter = async (config) => { throw httpError(config, 401, { code: 'UNAUTHORIZED', message: 'Invalid token' }); };

        await expect(client.get('/auth/me')).rejects.toThrow();

        expect(useAuthStore.getState().accessToken).toBeNull();
        expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('/login?expired=1'));
    });

    it('does not redirect on 401 from /auth/login', async () => {
        client.defaults.adapter = async (config) => { throw httpError(config, 401, { code: 'UNAUTHORIZED', message: 'Invalid credentials' }); };

        await expect(client.post('/auth/login', {})).rejects.toThrow();

        expect(router.navigate).not.toHaveBeenCalled();
        expect(useUIStore.getState().toasts[0]?.message).toBe('Invalid credentials');
    });

    it('passes 422 through without a toast', async () => {
        client.defaults.adapter = async (config) => { throw httpError(config, 422, { code: 'VALIDATION_ERROR', message: 'Validation error', details: {} }); };

        await expect(client.post('/auth/login', {})).rejects.toThrow();

        expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('toasts a retrying message on 5xx', async () => {
        client.defaults.adapter = async (config) => { throw httpError(config, 500, { code: 'INTERNAL_ERROR', message: 'Boom' }); };

        await expect(client.get('/x')).rejects.toThrow();

        expect(useUIStore.getState().toasts[0]).toMatchObject({ type: 'info', message: 'Server error. Retrying...' });
    });

    it('toasts the message on other 4xx', async () => {
        client.defaults.adapter = async (config) => { throw httpError(config, 404, { code: 'NOT_FOUND', message: 'Not found' }); };

        await expect(client.get('/x')).rejects.toThrow();

        expect(useUIStore.getState().toasts[0]).toMatchObject({ type: 'error', message: 'Not found' });
    });

    it('toasts a retrying message on network errors', async () => {
        client.defaults.adapter = async (config) => { throw networkError(config); };

        await expect(client.get('/x')).rejects.toThrow();

        expect(useUIStore.getState().toasts[0]).toMatchObject({ type: 'info' });
    });
});
