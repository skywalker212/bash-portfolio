import React, { forwardRef, useId } from 'react';
import styles from '@/styles/TerminalInput.module.css';
import { TerminalInputProps } from '@/types';

const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ value, onChange, prompt }, ref) => {
    const inputId = useId();
    return (
      <div className={styles.inputWrapper}>
        <label htmlFor={inputId} className={styles.prompt}>{prompt}</label>
        <input
          id={inputId}
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