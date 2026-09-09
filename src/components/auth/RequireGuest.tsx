import { Navigate, Outlet } from 'react-router-dom';
import { useIsAuthenticated } from '@/stores/authStore';

export function RequireGuest() {
    const isAuthenticated = useIsAuthenticated();
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}