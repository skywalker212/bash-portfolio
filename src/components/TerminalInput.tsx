import React, { forwardRef } from 'react';
import styles from '@/styles/TerminalInput.module.css';
import { TerminalInputProps } from '@/types';

const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ value, onChange, prompt }, ref) => {
    return (
      <div className={styles.inputWrapper}>
        <span className={styles.prompt}>{prompt}</span>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          className={styles.input}
        />
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';

export default TerminalInput;