import type { SalaryEntry } from '../types';

export const STORAGE_KEY = 'salary_history';
export const DARK_MODE_STORAGE_KEY = 'theme_preference';

export type ThemePreference = 'light' | 'dark' | 'system';

const getLocalStorage = (): Storage | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.localStorage;
};

export const loadSalaryHistory = (): SalaryEntry[] => {
  try {
    const storage = getLocalStorage();
    const data = storage?.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveSalaryHistory = (entries: SalaryEntry[]): void => {
  try {
    getLocalStorage()?.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage failures so calculator state remains usable.
  }
};

export const getSystemThemePreference = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  return false;
};

export const loadThemePreference = (): ThemePreference => {
  try {
    const stored = getLocalStorage()?.getItem(DARK_MODE_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }

    return 'system';
  } catch {
    return 'system';
  }
};

export const saveThemePreference = (preference: ThemePreference): void => {
  try {
    getLocalStorage()?.setItem(DARK_MODE_STORAGE_KEY, preference);
  } catch {
    // Ignore storage failures so theme changes can still apply in-memory.
  }
};

export const applyDarkMode = (isDark: boolean): void => {
  if (typeof document === 'undefined') {
    return;
  }

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
