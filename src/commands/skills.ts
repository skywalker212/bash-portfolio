import { Command, CommandResultType } from '@/types';

export const skillsCommand: Command = {
    name: 'skills',
    description: 'List my technical skills',
    execute: () => {
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
            type: CommandResultType.TABLE
        };
    }
};