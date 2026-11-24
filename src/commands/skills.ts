import { CommandResultType, TableCommandResult, TableType } from '@/types/terminal';
import { defineCommand } from './command';
import { ArgumentParser } from 'js-argparse';

const name = "skills";
const description = "List my technical skills";

const skillsArgs = new ArgumentParser(name, description);

export const skillsCommand = defineCommand({
    name,
    args: skillsArgs,
    description,
    execute: async (fileSystem): Promise<TableCommandResult> => {
        const { stdout } = await fileSystem.runPortfolioCommand('skills');
        const skills = stdout.trimEnd().split('\n').map(row => row.split('\t'));
        return {
            content: [
                ['Category', 'Skills'],
                ...skills
            ],
            type: CommandResultType.TABLE,
            tableType: TableType.NORMAL,
            columns: [{width: 15}, {width: 41, wrapWord: true}]
        };
    }
});
