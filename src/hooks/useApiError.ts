import axios from 'axios';
import { ApiError } from '@/utils/apiError';
import { useAddToast } from '@/stores/uiStore';

export type HandleError = (error: unknown, defaultMessage?: string) => ApiError | null;

function toApiError(error: unknown): ApiError | null {
    if (error instanceof ApiError) return error;
    if (axios.isAxiosError(error)) return ApiError.fromResponse(error);
    return null;
}

export function useApiError(): HandleError {
    const addToast = useAddToast();

    return (error, defaultMessage) => {
        const apiError = toApiError(error);

        if (apiError?.isValidationError) {
            return apiError;
        }

        if (apiError?.isConflict) {
            return null;
        }

        const message = defaultMessage ?? apiError?.message ?? 'Something went wrong';
        addToast({ type: 'error', message });
        return null;
    };
}
