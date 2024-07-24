import React, { useMemo } from 'react';
import dynamic from "next/dynamic";
import { CommandResult, CommandResultType, TableCommandResult } from '@/types';

interface OutputProps {
  outputs: CommandResult[];
}

const MemoizedTableOutput = React.memo(dynamic(() => import('./TableOutput')));
const MemoizedTerminalOutput = React.memo(dynamic(() => import('./TerminalOutput')));

const Output: React.FC<OutputProps> = ({ outputs }) => {
  const renderedOutputs = useMemo(() => {
    return outputs.map((item, index) => {
      if (item.type === CommandResultType.TABLE) {
        const tableResult = item as TableCommandResult;
        return (
          <MemoizedTableOutput
            key={`${index}-${tableResult.content}`}
            content={tableResult.content}
            type={tableResult.type}
            tableType={tableResult.tableType}
            columns={tableResult.columns}
          />
        );
      } else {
        return (
          <MemoizedTerminalOutput
            key={`${index}-${item.content}`}
            content={item.content}
            type={item.type}
          />
        );
      }
    });
  }, [outputs]);

  return <>{renderedOutputs}</>;
};

export default React.memo(Output);