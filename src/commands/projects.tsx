import { PROJECTS } from '@/config';
import { Command, CommandArgumentTypeEnum, CommandResult, CommandResultType, TableCommandResult, TableType } from '@/types';
import styles from '@/styles/TerminalOutput.module.css';
import { titleCase } from '@/utils';

type ProjectCommand = Command<[string]>;

export const projectsCommand: ProjectCommand = {
    name: 'projects',
    description: 'Display my notable projects',
    args: {
        optional: [
            {
                name: 'project_name',
                type: CommandArgumentTypeEnum.STRING
            }
        ]
    },
    execute: (_, projectName: string): CommandResult | TableCommandResult | (CommandResult | TableCommandResult)[] => {
        const projects = PROJECTS(window.location.origin);
        if (!projectName) {
            return [{
                content: [
                    ['Project', 'Technologies', 'Link'],
                    ...Object.values(projects).map(project => [
                        project.name,
                        project.technologies.join(', '),
                        project.link
                    ])
                ],
                type: CommandResultType.TABLE,
                tableType: TableType.NORMAL,
                columns: [{ width: 25 }, { width: 30, wrapWord: true }, { width: 55 }]
            }, {
                content: <p>More at: <a href="https://github.com/skywalker212" target="_blank" rel="noopener noreferrer" className={styles.terminalLink} >github.com/skywalker212</a></p>,
                type: CommandResultType.CUSTOM
            }];
        } else {
            const project = projects[projectName];
            if (!project) {
                return {
                    content: `Project "${projectName}" not found.`,
                    type: CommandResultType.ERROR
                };
            }
            return {
                content: Object.entries(project).map(([key, val]) => [
                    titleCase(key),
                    Array.isArray(val) ? val.join(', ') : String(val)
                ]),
                type: CommandResultType.TABLE,
                columns: [{ width: 15 }, { width: 55 }]
            };
        }
    }
};