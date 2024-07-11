import { TerminalStyle, InputStyle } from '@/types';

export const getTerminalStyle = (isDarkMode: boolean): TerminalStyle => {
  return {
    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
    color: isDarkMode ? '#00ff00' : '#000000',
  };
};

export const getInputStyle = (isDarkMode: boolean): InputStyle => {
  return {
    backgroundColor: 'transparent',
    color: isDarkMode ? '#00ff00' : '#000000',
    caretColor: isDarkMode ? '#00ff00' : '#000000',
  };
};