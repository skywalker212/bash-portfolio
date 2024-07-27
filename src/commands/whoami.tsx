import { Command, CommandResultType, TableType } from '@/types';
import styles from '@/styles/Output.module.css';
import { EXPERIENCE_TABLE, INTERNSHIP_TABLE, WHOAMI_TEXT } from '@/config';

export const whoamiCommand: Command = {
    name: 'whoami',
    description: 'Display information about me',
    execute: () => {
        return [{
            content: [[WHOAMI_TEXT]],
            type: CommandResultType.TABLE,
            tableType: TableType.TEXT,
            columns: [{width: 83, alignment: 'justify', wrapWord: true}]
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
                    <p><b>Resume:</b> <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className={styles.terminalLink} >{window.location.origin}/resume.pdf</a></p>
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