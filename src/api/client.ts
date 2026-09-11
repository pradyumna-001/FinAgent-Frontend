import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { ApiError } from '@/utils/apiError';
import { useUIStore } from '@/stores/uiStore';
import { router } from '@/router';

export const client = axios.create({
    baseURL: '/',
});

client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error)) {
            const apiError = ApiError.fromResponse(error);
            const isLoginRequest = error.config?.url?.startsWith('/auth/login');

            if (apiError.isAuthError && !isLoginRequest) {
                useAuthStore.getState().logout();
                router.navigate('/login?expired=1&path=' + encodeURIComponent(window.location.pathname + window.location.search));
            } else if (apiError.isValidationError) {
                // 422 - the form owns it via useApiError; no toast here
            } else if (apiError.isRetryable) {
                useUIStore.getState().addToast({ type: 'info', message: 'Server error. Retrying...' });
            } else {
                useUIStore.getState().addToast({ type: 'error', message: apiError.message });
            }
        }
        return Promise.reject(error);
    },
);
