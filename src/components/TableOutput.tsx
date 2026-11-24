import styles from '@/styles/Output.module.css';
import { TableCommandResult } from '@/types';
import { formatTable } from '@/utils/formatTable';
import { injectLinkToText } from './Output';

const TableOutput = (result: TableCommandResult) => (
    <div className={styles.output}>
        {injectLinkToText(formatTable(result))}
    </div>
);

export default TableOutput;
