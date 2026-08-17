import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, ThemeMode, ViewMode } from '@/types';

interface SettingsState extends AppSettings {
  setTheme: (theme: ThemeMode) => void;
  setDefaultView: (view: ViewMode) => void;
  setCompactSidebar: (compact: boolean) => void;
  setAutosaveDelay: (ms: number) => void;
  setSpellcheck: (enabled: boolean) => void;
  setShowWordCount: (enabled: boolean) => void;
  applyTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      compactSidebar: false,
      defaultView: 'list',
      autosaveDelay: 1500,
      spellcheck: true,
      showWordCount: true,
      defaultFont: 'Inter',
      defaultPageSize: 'A4',

      setTheme: (theme) => {
        set({ theme });
        get().applyTheme();
      },

      setDefaultView: (view) => set({ defaultView: view }),
      setCompactSidebar: (compact) => set({ compactSidebar: compact }),
      setAutosaveDelay: (ms) => set({ autosaveDelay: ms }),
      setSpellcheck: (enabled) => set({ spellcheck: enabled }),
      setShowWordCount: (enabled) => set({ showWordCount: enabled }),

      applyTheme: () => {
        const { theme } = get();
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else {
          // system
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', prefersDark);
        }
      },
    }),
    {
      name: 'docflow-settings',
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Apply theme on load
        state?.applyTheme();
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useSettingsStore.getState();
    if (state.theme === 'system') {
      state.applyTheme();
    }
  });
}
