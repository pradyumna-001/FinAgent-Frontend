import { createContext } from 'react';
import type { AuthState } from '@/stores/authStore';

export const AuthContext = createContext<AuthState | null>(null);