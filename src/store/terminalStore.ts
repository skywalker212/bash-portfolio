import { create } from 'zustand'
import { TerminalState } from '@/types'
import { terminalConfig } from '@/config'

interface TerminalStore extends TerminalState {
  addCommand: (command: string, output: string) => void
  changeDirectory: (newDirectory: string) => void
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  commandHistory: [],
  user: terminalConfig.user,
  host: terminalConfig.host,
  currentDirectory: terminalConfig.initialDirectory,
  addCommand: (command, output) => set((state) => ({
    commandHistory: [...state.commandHistory, { command, output }],
  })),
  changeDirectory: (newDirectory) => set({ currentDirectory: newDirectory }),
}))