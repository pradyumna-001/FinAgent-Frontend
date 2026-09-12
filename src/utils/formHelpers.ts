import { ApiError } from '@/utils/apiError';
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

export function setErrorsFromApiError<TFieldValues extends FieldValues>(
    apiError: ApiError,
    setError: UseFormSetError<TFieldValues>,
) {
    Object.entries(apiError.details ?? {}).forEach(([field, messages]) =>
        setError(field as FieldPath<TFieldValues>, { type: 'server', message: messages[0] }),
    );
}
