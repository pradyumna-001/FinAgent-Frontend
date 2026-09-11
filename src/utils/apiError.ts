import type { AxiosError } from "axios";

const STATUS_CODE_FALLBACK: Record<number, string> = {
    400: 'MISSING_HEADER',
    401: 'UNAUTHORIZED',
    403: 'RLS_VIOLATION',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
}

export class ApiError {
    status: number;
    code: string;
    message: string;
    details?: Record<string, string[]>;
    timestamp?: string;
    path?: string;

    constructor(status: number, code: string, message: string, details?: Record<string, string[]>, timestamp?: string, path?: string) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.details = details;
        this.timestamp = timestamp;
        this.path = path;
    }

    static fromResponse(error: AxiosError): ApiError {
        if (!error.response) {
            return new ApiError(0, 'NETWORK_ERROR', error.message);
        }

        const { status } = error.response;
        const data = error.response.data as {
            code?: string;
            message?: string;
            details?: Record<string, string[]>;
            timestamp?: string;
            path?: string;
            detail?: string;
        };

        const code = data.code ?? (status >= 500 ? 'INTERNAL_ERROR' : (STATUS_CODE_FALLBACK[status] ?? 'UNKNOWN'));
        const message = data.message ?? (typeof data.detail === 'string' ? data.detail : 'Request failed');

        return new ApiError(status, code, message, data.details, data.timestamp, data.path);
    }

    get isRetryable() {
        return this.status === 0 || this.status >= 500;
    }

    get isAuthError() {
        return this.status === 401;
    }

    get isValidationError() {
        return this.status === 422;
    }

    get isNotFound() {
        return this.status === 404;
    }

    get isForbidden() {
        return this.status === 403;
    }

    get isConflict() {
        return this.status === 409;
    }
}
