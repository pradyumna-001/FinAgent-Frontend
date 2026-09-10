import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { ThemeProvider, useTheme } from './ThemeProvider';

function Harness() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    return (
        <div>
            <span>theme:{theme}</span>
            <span>resolved:{resolvedTheme}</span>
            <button onClick={() => setTheme('dark')}>set-dark</button>
            <button onClick={() => setTheme('light')}>set-light</button>
        </div>
    );
}

const renderHarness = () =>
    render(
        <ThemeProvider>
            <Harness />
        </ThemeProvider>
    );

function matchMediaMock(matches: boolean) {
    const mql = {
        matches,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
    vi.mocked(window.matchMedia).mockReturnValue(mql);
}

beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
});

describe('ThemeProvider', () => {
    it('toggles .dark on <html> and persists to localStorage', () => {
        renderHarness();
        fireEvent.click(screen.getByText('set-dark'));

        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('finagent-theme')).toBe('dark');
    });

    it('reads the persisted theme from localStorage on mount', () => {
        localStorage.setItem('finagent-theme', 'light');
        matchMediaMock(true);

        renderHarness();

        expect(screen.getByText('theme:light')).toBeInTheDocument();
        expect(screen.getByText('resolved:light')).toBeInTheDocument();
    });

    it('respects the system preference when no theme is stored', () => {
        matchMediaMock(true);

        renderHarness();

        expect(screen.getByText('theme:system')).toBeInTheDocument();
        expect(screen.getByText('resolved:dark')).toBeInTheDocument();
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
});
