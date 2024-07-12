import { Command, CommandResultType, Project } from '@/types';
import { titleCase } from '@/utils';

const projects: { [id: string]: Project } = {
    "bash-portfolio": {
        name: 'Bash Portfolio',
        description: 'A bash-style portfolio website built with Next.js and TypeScript',
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand'],
        link: 'https://github.com/skywalker212/bash-portfolio'
    }
}

export const projectsCommand: Command = {
    name: 'projects',
    description: 'Display my notable projects',
    execute: (args: string[]) => {
        if (args.length === 0) {
            return {
                content: [
                    ['Project', 'Description', 'Technologies'],
                    ...Object.values(projects).map(project => [
                        project.name,
                        project.description,
                        project.technologies.join(', ')
                    ])
                ],
                type: CommandResultType.TABLE
            };
        } else {
            const project = projects[args[0]];
            if (!project) {
                return {
                    content: `Project "${args[0]}" not found.`,
                    type: CommandResultType.ERROR
                };
            }
            return {
                content: Object.entries(project).map(([key, val]) => [
                    titleCase(key),
                    Array.isArray(val) ? val.join(', ') : String(val)
                ]),
                type: CommandResultType.TABLE
            };
        }
    }
};