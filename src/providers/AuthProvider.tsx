import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { AuthState } from '@/stores/authStore'; 


const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuthStore();
    const { checkAuth } = auth;
    
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

