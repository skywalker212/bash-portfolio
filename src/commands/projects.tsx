import { PROJECTS } from '@/config';
import { Command, CommandResult, CommandResultType, TableCommandResult, TableType } from '@/types';
import styles from '@/styles/Output.module.css';
import { titleCase } from '@/utils';
import { ArgumentParser } from 'js-argparse';

const name = "projects";

type Args = {
    project_name?: string
}

type ProjectCommand = Command<Args>;

const projectsArgs = new ArgumentParser<Args>(name, 'Display my notable projects');

projectsArgs.addArgument(['project_name'], {
    required: false,
    metavar: "PROJECT_NAME",
    help: "Name of project"
})

export const projectsCommand: ProjectCommand = {
    name,
    args: projectsArgs,
    execute: (_, args): CommandResult | TableCommandResult | (CommandResult | TableCommandResult)[] => {
        if (!args.project_name) {
            return [{
                content: [
                    ['Project', 'Technologies', 'Link'],
                    ...Object.values(PROJECTS).map(project => [
                        project.name,
                        project.technologies.join(', '),
                        project.link
                    ])
                ],
                type: CommandResultType.TABLE,
                tableType: TableType.NORMAL,
                columns: [{ width: 25 }, { width: 30, wrapWord: true }, { width: 68 }]
            }, {
                content: <p>More at: <a href="https://github.com/skywalker212" target="_blank" rel="noopener noreferrer" className={styles.terminalLink} >github.com/skywalker212</a></p>,
                type: CommandResultType.CUSTOM
            }];
        } else {
            const project = PROJECTS[args.project_name];
            if (!project) {
                return {
                    content: `Project "${args.project_name}" not found.`,
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