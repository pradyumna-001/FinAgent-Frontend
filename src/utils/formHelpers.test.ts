import { describe, expect, it, vi } from 'vitest';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/utils/apiError';
import { setErrorsFromApiError } from './formHelpers';

function makeSetError() {
    const mock = vi.fn();
    return { mock, setError: mock as unknown as UseFormSetError<FieldValues> };
}

describe('setErrorsFromApiError', () => {
    it('maps each details entry to a setError call with the first message', () => {
        const { mock, setError } = makeSetError();
        const apiError = new ApiError(422, 'VALIDATION_ERROR', 'Invalid', {
            email: ['not a valid email', 'also too long'],
            password: ['too short'],
        });

        setErrorsFromApiError(apiError, setError);

        expect(mock).toHaveBeenCalledTimes(2);
        expect(mock).toHaveBeenCalledWith('email', { type: 'server', message: 'not a valid email' });
        expect(mock).toHaveBeenCalledWith('password', { type: 'server', message: 'too short' });
    });

    it('no-ops when details is undefined', () => {
        const { mock, setError } = makeSetError();
        setErrorsFromApiError(new ApiError(500, 'INTERNAL_ERROR', 'boom'), setError);
        expect(mock).not.toHaveBeenCalled();
    });

    it('no-ops on empty details', () => {
        const { mock, setError } = makeSetError();
        setErrorsFromApiError(new ApiError(422, 'VALIDATION_ERROR', 'bad', {}), setError);
        expect(mock).not.toHaveBeenCalled();
    });
});
