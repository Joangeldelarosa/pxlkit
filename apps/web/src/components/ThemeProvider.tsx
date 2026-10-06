'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'pxlkit-theme';

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage may be blocked
  }
  // Default to dark (brand theme)
  return 'dark';
}

// Only a pick on this page changes the stored theme, and that pick is state.
const subscribeNever = () => () => {};
const brandTheme = (): Theme => 'dark';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The server cannot know the stored theme and renders the brand theme, as
  // does the render that hydrates its markup; the stored theme follows right
  // after. The layout's inline script has already put its class on <html>.
  const stored = useSyncExternalStore(subscribeNever, readStoredTheme, brandTheme);
  // A theme picked on this page, which lasts where storage is blocked too.
  const [picked, setPicked] = useState<Theme | null>(null);
  const theme = picked ?? stored;

  const setTheme = useCallback((next: Theme) => {
    setPicked(next);
    applyThemeToDOM(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
