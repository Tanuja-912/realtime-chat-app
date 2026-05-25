import { create } from 'zustand'

export type Theme =
  | 'dark'
  | 'ocean'
  | 'neon'
  | 'glass'
  | 'sunset'
  | 'space'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}))