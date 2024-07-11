import React, { forwardRef, ChangeEvent, KeyboardEvent } from 'react';
import styles from '@/styles/TerminalInput.module.css';

interface TerminalInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  prompt: string;
}

const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ value, onChange, onSubmit, prompt }, ref) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };

    return (
      <div className={styles.inputWrapper}>
        <span className={styles.prompt}>{prompt}</span>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className={styles.input}
        />
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';

export default TerminalInput;