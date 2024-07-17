import { create } from 'zustand'
import { TerminalState } from '@/types'
import { terminalConfig } from '@/config'

export interface TerminalStore extends TerminalState {
  addCommandToHistory: (command: string) => void
  setHistoryIndex: (index: number) => void
  changeDirectory: (newDirectory: string) => void
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  commandHistory: [],
  user: terminalConfig.user,
  host: terminalConfig.host,
  currentDirectory: terminalConfig.initialDirectory,
  historyIndex: 0,
  addCommandToHistory: (command) => set((state) => ({
    commandHistory: [...state.commandHistory, command],
    historyIndex: state.commandHistory.length + 1
  })),
  setHistoryIndex: (index) => set(() => ({
    historyIndex: index
  })),
  changeDirectory: (newDirectory) => set({ currentDirectory: newDirectory }),
}));

export const getPreviousCommand = () => {
  const state = useTerminalStore.getState();
  const commandHistory = state.commandHistory;
  const historyIndex = state.historyIndex;
  if (historyIndex > 0) {
    state.setHistoryIndex(historyIndex - 1);
    return commandHistory[historyIndex - 1];
  } else {
    return null;
  }
}

export const getNextCommand = () => {
  const state = useTerminalStore.getState();
  const commandHistory = state.commandHistory;
  const historyIndex = state.historyIndex;
  if (historyIndex < commandHistory.length - 1) {
    state.setHistoryIndex(historyIndex + 1);
    return commandHistory[historyIndex + 1];
  } else if (historyIndex === commandHistory.length - 1) {
    state.setHistoryIndex(commandHistory.length);
    return '';
  }
  return null;
}