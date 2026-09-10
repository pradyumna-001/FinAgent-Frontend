import { createContext, useContext, useEffect, useLayoutEffect,useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'finagent-theme';

export interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    });

    const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

    const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

    useEffect(() => {
        if (theme !== 'system') return;
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
        setSystemDark(mql.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, [theme]);

    useLayoutEffect(() => {
        document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
        document.documentElement.style.colorScheme = resolvedTheme;
    }, [resolvedTheme]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}