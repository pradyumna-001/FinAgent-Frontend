import { describe, expect, it } from 'vitest';
import type { AxiosError } from 'axios';
import { ApiError } from './apiError';

function httpError(status: number, data: unknown): AxiosError {
    return {
        message: 'Request failed',
        response: { status, data },
    } as unknown as AxiosError;
}

function networkError(): AxiosError {
    return {
        message: 'Network Error',
    } as unknown as AxiosError;
}

describe('ApiError', () => {
    it('parses a 422 validation error with details', () => {
        const err = ApiError.fromResponse(httpError(422, {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: { email: ['not a valid email'] },
            timestamp: '2026-09-11T00:00:00Z',
            path: '/auth/login',
        }));

        expect(err.status).toBe(422);
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.message).toBe('Validation error');
        expect(err.details).toEqual({ email: ['not a valid email'] });
        expect(err.timestamp).toBe('2026-09-11T00:00:00Z');
        expect(err.path).toBe('/auth/login');
        expect(err.isValidationError).toBe(true);
    });

    it('parses 401, 403, 404, and 500', () => {
        expect(ApiError.fromResponse(httpError(401, { code: 'UNAUTHORIZED' })).isAuthError).toBe(true);
        expect(ApiError.fromResponse(httpError(403, { code: 'RLS_VIOLATION' })).isForbidden).toBe(true);
        expect(ApiError.fromResponse(httpError(404, { code: 'NOT_FOUND' })).isNotFound).toBe(true);
        expect(ApiError.fromResponse(httpError(500, { code: 'INTERNAL_ERROR' })).isRetryable).toBe(true);
    });

    it('parses a network error as status 0', () => {
        const err = ApiError.fromResponse(networkError());

        expect(err.status).toBe(0);
        expect(err.code).toBe('NETWORK_ERROR');
        expect(err.message).toBe('Network Error');
        expect(err.isRetryable).toBe(true);
    });

    it('derives each guard from status', () => {
        expect(ApiError.fromResponse(networkError()).isRetryable).toBe(true);
        expect(ApiError.fromResponse(httpError(401, {})).isAuthError).toBe(true);
        expect(ApiError.fromResponse(httpError(403, {})).isForbidden).toBe(true);
        expect(ApiError.fromResponse(httpError(404, {})).isNotFound).toBe(true);
        expect(ApiError.fromResponse(httpError(409, {})).isConflict).toBe(true);
        expect(ApiError.fromResponse(httpError(422, {})).isValidationError).toBe(true);

        expect(ApiError.fromResponse(httpError(404, {})).isValidationError).toBe(false);
        expect(ApiError.fromResponse(httpError(200, {})).isRetryable).toBe(false);
    });

    it('falls back to a status-derived code for legacy bodies', () => {
        const err = ApiError.fromResponse(httpError(404, { detail: 'Not Found' }));

        expect(err.code).toBe('NOT_FOUND');
        expect(err.message).toBe('Not Found');
    });

    it('normalizes a null details to undefined', () => {
        const err = ApiError.fromResponse(httpError(401, { code: 'UNAUTHORIZED', details: null }));

        expect(err.details).toBeUndefined();
    });
});