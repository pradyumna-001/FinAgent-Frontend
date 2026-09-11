import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { QueryProvider } from './QueryProvider';

function httpError(status: number, data: unknown): AxiosError {
    const response = { data, status, statusText: 'error', headers: {}, config: {} as InternalAxiosRequestConfig } as unknown as AxiosResponse;
    return new AxiosError('Request failed', undefined, {} as InternalAxiosRequestConfig, undefined, response);
}

function QueryHarness({ queryFn }: { queryFn: () => Promise<unknown> }) {
    useQuery({ queryKey: ['test'], queryFn });
    return null;
}

function MutationHarness({ mutationFn }: { mutationFn: () => Promise<unknown> }) {
    const { mutate } = useMutation({ mutationFn });
    return <button onClick={() => mutate()}>fire</button>;
}

afterEach(() => {
    vi.useRealTimers();
});

describe('QueryProvider', () => {
    it('retries 3 times for retryable errors', async () => {
        vi.useFakeTimers();
        const queryFn = vi.fn().mockRejectedValue(httpError(500, { code: 'INTERNAL_ERROR' }));
        render(<QueryProvider><QueryHarness queryFn={queryFn} /></QueryProvider>);

        await act(async () => { await vi.advanceTimersByTimeAsync(10000); });

        expect(queryFn).toHaveBeenCalledTimes(4);
    });

    it('does not retry non-retryable errors', async () => {
        vi.useFakeTimers();
        const queryFn = vi.fn().mockRejectedValue(httpError(404, { code: 'NOT_FOUND' }));
        render(<QueryProvider><QueryHarness queryFn={queryFn} /></QueryProvider>);

        await act(async () => { await vi.advanceTimersByTimeAsync(10000); });

        expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it('does not retry non-axios errors', async () => {
        vi.useFakeTimers();
        const queryFn = vi.fn().mockRejectedValue(new Error('boom'));
        render(<QueryProvider><QueryHarness queryFn={queryFn} /></QueryProvider>);

        await act(async () => { await vi.advanceTimersByTimeAsync(10000); });

        expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it('does not retry mutations', async () => {
        vi.useFakeTimers();
        const mutationFn = vi.fn().mockRejectedValue(httpError(500, { code: 'INTERNAL_ERROR' }));
        render(<QueryProvider><MutationHarness mutationFn={mutationFn} /></QueryProvider>);

        fireEvent.click(screen.getByRole('button', { name: 'fire' }));
        await act(async () => { await vi.advanceTimersByTimeAsync(10000); });

        expect(mutationFn).toHaveBeenCalledTimes(1);
    });
});
