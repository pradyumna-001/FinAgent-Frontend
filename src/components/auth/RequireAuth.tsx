import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, useIsAuthenticated } from '@/stores/authStore';

export function RequireAuth() {
    const isAuthenticated = useIsAuthenticated();
    const isLoading = useAuthStore((state) => state.isLoading);
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) {
        return <div>Loading…</div>;
    }

    if (!isAuthenticated) {
        const returnTo = location.pathname + location.search;
        return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
    }

    return <Outlet />;
}