import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ThemeState } from '@/types'

interface ThemeStore extends ThemeState {
  toggleDarkMode: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: true,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'theme-storage',
    }
  )
)