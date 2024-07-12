import React, { forwardRef, KeyboardEvent } from 'react';
import styles from '@/styles/TerminalInput.module.css';
import { TerminalInputProps } from '@/types';

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