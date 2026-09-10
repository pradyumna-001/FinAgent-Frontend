import { useEffect, useLayoutEffect, useState } from 'react';
import { ThemeContext, type Theme } from './ThemeContext';

const STORAGE_KEY = 'finagent-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    });

    const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

    const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

    useEffect(() => {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

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