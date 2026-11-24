import { Command, CommandResult, CommandResultType, TableCommandResult, TableType } from '@/types';
import styles from '@/styles/Output.module.css';
import { ArgumentParser } from 'js-argparse';

const name = "projects";
const description = 'Display my notable projects';

type Args = {
    project_name?: string
}

type ProjectCommand = Command<Args>;

const projectsArgs = new ArgumentParser<Args>(name, description);

projectsArgs.addArgument(['project_name'], {
    required: false,
    metavar: "PROJECT_NAME",
    help: "Name of project"
})

export const projectsCommand: ProjectCommand = {
    name,
    args: projectsArgs,
    description,
    execute: async ({ fileSystem }, args): Promise<CommandResult | CommandResult[]> => {
        const { stdout, exitCode } = await fileSystem.runPortfolioCommand('projects', args.project_name ? [args.project_name] : []);
        const projects = stdout.trimEnd().split('\n').map(row => row.split('\t'));
        if (!args.project_name) {
            return [{
                content: [
                    ['Project', 'Technologies', 'Link'],
                    ...projects.map(([, name, , technologies, link]) => [name, technologies, link])
                ],
                type: CommandResultType.TABLE,
                tableType: TableType.NORMAL,
                columns: [{ width: 25 }, { width: 30, wrapWord: true }, { width: 68 }]
            } as TableCommandResult, {
                content: <p>More at: <a href="https://github.com/skywalker212" target="_blank" rel="noopener noreferrer" className={styles.terminalLink} >github.com/skywalker212</a></p>,
                type: CommandResultType.CUSTOM
            }];
        } else {
            if (exitCode === 1) {
                return {
                    content: `Project "${args.project_name}" not found.`,
                    type: CommandResultType.ERROR
                };
            }
            const [, name, description, technologies, link] = projects[0];
            return {
                content: [['Name', name], ['Description', description], ['Technologies', technologies], ['Link', link]],
                type: CommandResultType.TABLE,
                columns: [{ width: 15 }, { width: 55 }]
            } as TableCommandResult;
        }
    }
};