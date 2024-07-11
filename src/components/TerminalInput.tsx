import React, { forwardRef, ChangeEvent, FormEvent } from 'react';

interface TerminalInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  className?: string;
}

const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ value, onChange, onSubmit, className }, ref) => {
    return (
      <form onSubmit={onSubmit} className="flex items-center">
        <span className="mr-2">$</span>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          className={`bg-transparent outline-none flex-grow caret-green-500 ${className || ''}`}
          style={{ fontSize: 'inherit' }}
        />
      </form>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';

export default TerminalInput;