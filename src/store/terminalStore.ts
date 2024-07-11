import { create } from 'zustand'
import { TerminalState } from '@/types'

interface TerminalStore extends TerminalState {
  addCommand: (command: string, output: string) => void
  changeDirectory: (newDirectory: string) => void
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  commandHistory: [],
  currentDirectory: '~',
  addCommand: (command, output) => set((state) => ({
    commandHistory: [...state.commandHistory, { command, output }],
  })),
  changeDirectory: (newDirectory) => set({ currentDirectory: newDirectory }),
}))