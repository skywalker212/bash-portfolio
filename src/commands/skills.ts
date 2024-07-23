import { Command, CommandResultType, TableCommandResult, TableType } from '@/types';

export const skillsCommand: Command = {
    name: 'skills',
    description: 'List my technical skills',
    execute: (): TableCommandResult => {
        return {
            content: [
                ['Category', 'Skills'],
                ['Languages', 'Python, TypeScript, Java'],
                ['Frontend', 'Next.js, Angular, React'],
                ['Backend', 'Node.js, Express, Django'],
                ['Databases', 'PostgreSQL, MongoDB, Redis'],
                ['DevOps', 'Docker, Kubernetes, Jenkins'],
                ['Other', 'pyTorch, Kafka']
            ],
            type: CommandResultType.TABLE,
            tableType: TableType.NORMAL,
            columns: [{width: 15}, {width: 30}]
        };
    }
};