import React from 'react';
import { CommandResult } from '@/types';
import styles from '@/styles/TerminalOutput.module.css';

interface TerminalInitialRenderProps {
  initialRender: CommandResult[];
}

const TerminalInitialRender: React.FC<TerminalInitialRenderProps> = ({ initialRender }) => {
  return (
    <>
      {initialRender.map((item, index) => (
        <div key={index} className={styles.output}>
          {item.content}
        </div>
      ))}
    </>
  );
};

export default TerminalInitialRender;