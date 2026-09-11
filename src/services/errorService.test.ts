import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleAsyncError, log } from './errorService';

describe('errorService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('log calls console.error', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        log(new Error('boom'));
        expect(spy).toHaveBeenCalled();
    });

    it('log prefixes context when provided', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        log(new Error('boom'), 'render');
        expect(spy).toHaveBeenCalledWith('[render]', expect.any(Error));
    });

    it('handleAsyncError logs and swallows a rejected promise', async () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const result = await handleAsyncError(Promise.reject(new Error('async boom')));
        expect(spy).toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('handleAsyncError passes through resolved promises', async () => {
        const result = await handleAsyncError(Promise.resolve(42));
        expect(result).toBe(42);
    });
});
