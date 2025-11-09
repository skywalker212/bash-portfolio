import { create } from 'zustand'
import { FileOutputStream, TerminalOutputStream, TerminalState } from '@/types'
import { terminalConfig } from '@/config'

export interface TerminalStore extends TerminalState {
  addCommandToHistory: (command: string) => void
  setHistoryIndex: (index: number) => void
  setOutputStream: (stream: TerminalOutputStream, streamInfo?: FileOutputStream) => void
  changeDirectory: (newDirectory: string) => void
  setReplMode: (mode: string | null, data?: unknown) => void
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  commandHistory: [],
  user: terminalConfig.user,
  host: terminalConfig.host,
  outputStream: TerminalOutputStream.STDOUT,
  currentDirectory: terminalConfig.initialDirectory,
  historyIndex: 0,
  replMode: null,
  replData: null,
  addCommandToHistory: (command) => set((state) => ({
    commandHistory: [...state.commandHistory, command],
    historyIndex: state.commandHistory.length + 1
  })),
  setHistoryIndex: (index) => set(() => ({
    historyIndex: index
  })),
  setOutputStream: (stream, streamInfo) => set(() => ({
    outputStream: stream,
    ...streamInfo ? { streamInfo } : {}
  })),
  changeDirectory: (newDirectory) => set({ currentDirectory: newDirectory }),
  setReplMode: (mode, data) => set(() => ({
    replMode: mode,
    replData: data
  })),
}));

export const getOutputStream = () => {
  const state = useTerminalStore.getState();
  return {
    outputStream: state.outputStream,
    streamInfo: state.streamInfo
  }
}

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