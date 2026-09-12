import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import type { AxiosError } from 'axios';
import { ApiError } from '@/utils/apiError';
import { useUIStore } from '@/stores/uiStore';
import { useApiError } from './useApiError';

function httpError(status: number, data: unknown = {}): AxiosError {
    return { message: 'Request failed', response: { status, data } } as unknown as AxiosError;
}

function networkError(): AxiosError {
    return { message: 'Network Error', isAxiosError: true } as unknown as AxiosError;
}

describe('useApiError', () => {
    beforeEach(() => {
        useUIStore.setState({
            toasts: [],
            modals: {},
            sidebarOpen: false,
            density: 'comfortable',
            defaultDateRange: 'today',
        });
    });

    it('returns the ApiError for a 422 and does not toast', () => {
        const { result } = renderHook(() => useApiError());
        const apiError = ApiError.fromResponse(httpError(422, { code: 'VALIDATION_ERROR', details: { email: ['bad'] } }));

        let returned: ApiError | null = null;
        act(() => { returned = result.current(apiError); });

        expect(returned).toBe(apiError);
        expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('returns null for a 409 and does not toast', () => {
        const { result } = renderHook(() => useApiError());
        const apiError = ApiError.fromResponse(httpError(409, { code: 'CONFLICT' }));

        let returned: ApiError | null = null;
        act(() => { returned = result.current(apiError); });

        expect(returned).toBeNull();
        expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('toasts for a 500 and returns null', () => {
        const { result } = renderHook(() => useApiError());
        const apiError = ApiError.fromResponse(httpError(500, { code: 'INTERNAL_ERROR', message: 'Boom' }));

        let returned: ApiError | null = null;
        act(() => { returned = result.current(apiError); });

        expect(returned).toBeNull();
        expect(useUIStore.getState().toasts[0]).toMatchObject({ type: 'error', message: 'Boom' });
    });

    it('toasts for a network error and returns null', () => {
        const { result } = renderHook(() => useApiError());

        let returned: ApiError | null = null;
        act(() => { returned = result.current(networkError()); });

        expect(returned).toBeNull();
        expect(useUIStore.getState().toasts[0].message).toBe('Network Error');
    });

    it('toasts for 403 and 404', () => {
        const { result } = renderHook(() => useApiError());
        const forbidden = ApiError.fromResponse(httpError(403, { code: 'RLS_VIOLATION', message: 'Denied' }));
        const notFound = ApiError.fromResponse(httpError(404, { code: 'NOT_FOUND', message: 'Missing' }));

        act(() => {
            result.current(forbidden);
            result.current(notFound);
        });

        expect(useUIStore.getState().toasts.map((t) => t.message)).toEqual(['Denied', 'Missing']);
    });

    it('toasts the fallback for an unknown error and returns null', () => {
        const { result } = renderHook(() => useApiError());

        let returned: ApiError | null = null;
        act(() => { returned = result.current(new Error('plain js error')); });

        expect(returned).toBeNull();
        expect(useUIStore.getState().toasts[0].message).toBe('Something went wrong');
    });

    it('uses defaultMessage over the ApiError message', () => {
        const { result } = renderHook(() => useApiError());
        const apiError = ApiError.fromResponse(httpError(500, { code: 'INTERNAL_ERROR', message: 'Boom' }));

        act(() => { result.current(apiError, 'Please try again'); });

        expect(useUIStore.getState().toasts[0].message).toBe('Please try again');
    });
});
