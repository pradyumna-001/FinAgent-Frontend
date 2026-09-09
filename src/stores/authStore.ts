import { login as apiLogin } from '@/api/auth';
import type { Manager } from '@/types/api';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import axios from 'axios'
import { getMe } from '@/api/auth'


interface AuthState {
    accessToken: string | null
    manager: Manager | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    checkAuth: () => Promise<void>
}


export const useIsAuthenticated = () =>
    useAuthStore((state) => state.accessToken !== null)


export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            manager: null,
            isLoading: false,
            login: async (email, password) => {
                set({ isLoading: true })
                try {
                    const { access_token, manager } = await apiLogin(email, password)
                    set({ accessToken: access_token, manager })
                } finally {
                    set({ isLoading : false })
                }
            },
            logout: () => set({ accessToken: null, manager: null }),
            checkAuth: async () => {
                set({ isLoading: true })
                try {
                    const manager = await getMe()
                    set({ manager })
                } catch (error) {
                    if (axios.isAxiosError(error) && error.response?.status === 401) {
                        get().logout()
                    }
                } finally {
                    set({ isLoading: false })
                }
            },
        }),
        {
            name: 'finagent-auth',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (s) => ({ accessToken: s.accessToken, manager: s.manager }),
        },
    ),
)
