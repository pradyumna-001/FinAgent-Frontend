import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuthStore();
    const { checkAuth } = auth;

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}