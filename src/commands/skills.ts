import { Command, CommandResultType } from '@/types';

export const skillsCommand: Command = {
    name: 'skills',
    description: 'List my technical skills',
    execute: () => {
        return {
            content: [
                ['Category', 'Skills'],
                ['Languages', 'TypeScript, Python, Java, C++'],
                ['Frontend', 'React, Next.js, HTML, CSS'],
                ['Backend', 'Node.js, Express, Django'],
                ['Databases', 'PostgreSQL, MongoDB, Redis'],
                ['DevOps', 'Docker, Kubernetes, CI/CD'],
                ['Other', 'Machine Learning, RESTful APIs, GraphQL']
            ],
            type: CommandResultType.TABLE
        };
    }
};