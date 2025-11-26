import { create } from 'zustand'
import { FileOutputStream, TerminalOutputStream, TerminalState } from '@/types'
import { terminalConfig } from '@/config'

export interface TerminalStore extends TerminalState {
  addCommandToHistory: (command: string) => void
  addDuckdbCommandToHistory: (command: string) => void
  setHistoryIndex: (index: number) => void
  setDuckdbHistoryIndex: (index: number) => void
  setOutputStream: (stream: TerminalOutputStream, streamInfo?: FileOutputStream) => void
  changeDirectory: (newDirectory: string) => void
  setReplMode: (mode: string | null, data?: unknown) => void
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  commandHistory: [],
  duckdbCommandHistory: [],
  user: terminalConfig.user,
  host: terminalConfig.host,
  outputStream: TerminalOutputStream.STDOUT,
  currentDirectory: terminalConfig.initialDirectory,
  historyIndex: 0,
  duckdbHistoryIndex: 0,
  replMode: null,
  replData: null,
  addCommandToHistory: (command) => set((state) => ({
    commandHistory: [...state.commandHistory, command],
    historyIndex: state.commandHistory.length + 1
  })),
  addDuckdbCommandToHistory: (command) => set((state) => ({
    duckdbCommandHistory: [...state.duckdbCommandHistory, command],
    duckdbHistoryIndex: state.duckdbCommandHistory.length + 1
  })),
  setHistoryIndex: (index) => set(() => ({
    historyIndex: index
  })),
  setDuckdbHistoryIndex: (index) => set(() => ({
    duckdbHistoryIndex: index
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
  const isDuckdbMode = state.replMode === 'duckdb';
  const commandHistory = isDuckdbMode ? state.duckdbCommandHistory : state.commandHistory;
  const historyIndex = isDuckdbMode ? state.duckdbHistoryIndex : state.historyIndex;
  const setIndex = isDuckdbMode ? state.setDuckdbHistoryIndex : state.setHistoryIndex;

  if (historyIndex > 0) {
    setIndex(historyIndex - 1);
    return commandHistory[historyIndex - 1];
  } else {
    return null;
  }
}

export const getNextCommand = () => {
  const state = useTerminalStore.getState();
  const isDuckdbMode = state.replMode === 'duckdb';
  const commandHistory = isDuckdbMode ? state.duckdbCommandHistory : state.commandHistory;
  const historyIndex = isDuckdbMode ? state.duckdbHistoryIndex : state.historyIndex;
  const setIndex = isDuckdbMode ? state.setDuckdbHistoryIndex : state.setHistoryIndex;

  if (historyIndex < commandHistory.length - 1) {
    setIndex(historyIndex + 1);
    return commandHistory[historyIndex + 1];
  } else if (historyIndex === commandHistory.length - 1) {
    setIndex(commandHistory.length);
    return '';
  }
  return null;
}