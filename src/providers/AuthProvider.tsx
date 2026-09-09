import { createContext, useContext } from 'react';
import { useAuthStore } from '@/stores/authStore';


const AuthContext = createContext<ReturnType<typeof useAuthStore>>(null as never);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuthStore();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
