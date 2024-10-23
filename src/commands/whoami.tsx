import { Command, CommandResultType, TableType } from '@/types';
import styles from '@/styles/Output.module.css';
import { EXPERIENCE_TABLE, INTERNSHIP_TABLE } from '@/config';
import { ArgumentParser } from 'js-argparse';

const name = "whoami";
const description = "Display information about me";

const whoamiArgs = new ArgumentParser(name, description);

export const whoamiCommand: Command = {
    name,
    args: whoamiArgs,
    description,
    execute: () => {
        return [
        {
            content: (
                <div>
                    <p>Hey, I&apos;m Akash, Software Engineer at <a href="https://sumble.com" target="_blank" rel="noopener noreferrer" className={styles.terminalLink}>Sumble</a></p>
                </div>
            ),
            type: CommandResultType.CUSTOM
        },
        {
            content: <b>EXPERIENCE</b>,
            type: CommandResultType.CUSTOM
        },
        {
            content: EXPERIENCE_TABLE,
            type: CommandResultType.TABLE,
            tableType: TableType.NORMAL,
            columns: [{width: 15}, {width: 30}, {width: 28}]
        },
        {
            content: <b>INTERNSHIPS</b>,
            type: CommandResultType.CUSTOM
        },
        {
            content: INTERNSHIP_TABLE,
            type: CommandResultType.TABLE,
            tableType: TableType.NORMAL,
            columns: [{width: 15}, {width: 30}, {width: 28, wrapWord: true}]
        },
        {
            content: (
                <div>
                    <p><b>Email:</b> <a href="mailto:me@akash.is" target="_blank" rel="noopener noreferrer" className={styles.terminalLink} >me@akash.is</a></p>
                    <p><b>LinkedIn:</b> <a href="https://www.linkedin.com/in/akashagajjar" target="_blank" rel="noopener noreferrer" className={styles.terminalLink} >linkedin.com/in/akashagajjar</a> </p>
                    <p><b>GitHub:</b> <a href="https://github.com/skywalker212" target="_blank" rel="noopener noreferrer" className={styles.terminalLink} >github.com/skywalker212</a></p>
                    <p><b>Blog:</b> <a href="https://blog.akash.is" target="_blank" rel="noopener noreferrer" className={styles.terminalLink} >blog.akash.is</a></p>
                </div>
            ),
            type: CommandResultType.CUSTOM
        }
        ];
    }
};