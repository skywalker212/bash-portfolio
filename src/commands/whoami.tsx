import { CommandResultType, TableType } from '@/types/terminal';
import { defineCommand } from './command';
import styles from '@/styles/Output.module.css';
import { ArgumentParser } from 'js-argparse';

const name = "whoami";
const description = "Display information about me";

const whoamiArgs = new ArgumentParser(name, description);

interface Profile {
    intro: string;
    company: [text: string, href: string];
    experience: string[][];
    internships: string[][];
    contacts: [label: string, text: string, href: string, suffix?: string][];
}

const link = (text: string, href: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.terminalLink}>{text}</a>
);

export const whoamiCommand = defineCommand({
    name,
    args: whoamiArgs,
    description,
    execute: async (fileSystem) => {
        const { stdout } = await fileSystem.runPortfolioCommand('whoami');
        const { intro, company, experience, internships, contacts } = JSON.parse(stdout) as Profile;
        return [
        {
            content: (
                <div>
                    <p>{intro}{link(...company)}</p>
                </div>
            ),
            type: CommandResultType.CUSTOM
        },
        {
            content: <b>EXPERIENCE</b>,
            type: CommandResultType.CUSTOM
        },
        {
            content: experience,
            type: CommandResultType.TABLE,
            tableType: TableType.NORMAL,
            columns: [{width: 15}, {width: 30}, {width: 28}]
        },
        {
            content: <b>INTERNSHIPS</b>,
            type: CommandResultType.CUSTOM
        },
        {
            content: internships,
            type: CommandResultType.TABLE,
            tableType: TableType.NORMAL,
            columns: [{width: 15}, {width: 30}, {width: 28, wrapWord: true}]
        },
        {
            content: (
                <div>
                    {contacts.map(([label, text, href, suffix]) => (
                        <p key={label}><b>{label}:</b> {link(text, href)}{suffix}</p>
                    ))}
                </div>
            ),
            type: CommandResultType.CUSTOM
        }
        ];
    }
});
