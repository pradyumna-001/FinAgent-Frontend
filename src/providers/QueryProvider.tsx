import { useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { ApiError } from '@/utils/apiError'

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: (failureCount, error) => {
                    if (!axios.isAxiosError(error)) return false;
                    return ApiError.fromResponse(error).isRetryable && failureCount < 3;
                },
                retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
            },
            mutations: { retry: false },
        },
    }));

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
