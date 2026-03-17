import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  readonly sidebarOpen: boolean;
  readonly isDarkMode: boolean;
}

interface UiActions {
  readonly toggleSidebar: () => void;
  readonly setSidebarOpen: (open: boolean) => void;
  readonly toggleDarkMode: () => void;
  readonly setDarkMode: (dark: boolean) => void;
}

type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      isDarkMode: false,

      toggleSidebar: () =>
        set((state) => ({ ...state, sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open: boolean) =>
        set((state) => ({ ...state, sidebarOpen: open })),

      toggleDarkMode: () =>
        set((state) => ({ ...state, isDarkMode: !state.isDarkMode })),

      setDarkMode: (dark: boolean) =>
        set((state) => ({ ...state, isDarkMode: dark })),
    }),
    {
      name: 'paying-tool-ui',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        sidebarOpen: state.sidebarOpen,
      }),
    },
  ),
);
