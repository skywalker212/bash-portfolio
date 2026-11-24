import { memo } from 'react';
import styles from '@/styles/Output.module.css';
import { CommandResultType, type CommandResult } from '@/types/terminal';
import { formatTable } from '@/utils/formatTable';

function linkify(text: string) {
    return text.split(/(https?:\/\/[^\s]+)/g).map((part, index) => index % 2 === 0 ? part : (
        <a key={index} href={part} className={styles.terminalLink} target="_blank" rel="noopener noreferrer">
            {part}
        </a>
    ));
}

const OutputRow = memo(function OutputRow({ result }: { result: CommandResult }) {
    switch (result.type) {
        case CommandResultType.NONE:
            return null;
        case CommandResultType.INPUT: {
            const [prompt, ...command] = result.content.split(' ');
            return (
                <div className={`${styles.output} ${styles.input}`}>
                    <span className={styles.prompt}>{prompt}</span>
                    <span>{command.join(' ')}</span>
                </div>
            );
        }
        case CommandResultType.TABLE:
            return <div className={styles.output}>{linkify(formatTable(result))}</div>;
        case CommandResultType.TEXT:
            return <div className={styles.output}>{linkify(result.content)}</div>;
        case CommandResultType.ERROR:
            return <div className={`${styles.output} ${styles.error}`}>{result.content}</div>;
        case CommandResultType.CUSTOM:
            return <div className={styles.output}>{result.content}</div>;
    }
});

export default memo(function Output({ outputs }: { outputs: CommandResult[] }) {
    return outputs.map((result, index) => <OutputRow key={index} result={result} />);
});
