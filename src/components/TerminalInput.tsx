import { forwardRef, useId, type ChangeEventHandler, type KeyboardEventHandler } from 'react';
import styles from '@/styles/TerminalInput.module.css';

interface TerminalInputProps {
  value: string;
  prompt: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
}

const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ value, onChange, onKeyDown, prompt }, ref) => {
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
          onKeyDown={onKeyDown}
          className={styles.input}
          autoFocus
        />
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';

export default TerminalInput;
