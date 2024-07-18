import { Command, CommandArgumentTypeEnum, CommandResultType, Project } from '@/types';
import { titleCase } from '@/utils';

const projects: { [id: string]: Project } = {
    "bash-portfolio": {
        name: 'Bash Portfolio',
        description: 'A bash-style portfolio website built with Next.js and TypeScript',
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand'],
        link: 'https://github.com/skywalker212/bash-portfolio'
    }
}

type ProjectCommand = Command<[string]>;

export const projectsCommand: ProjectCommand = {
    name: 'projects',
    description: 'Display my notable projects',
    args: [
        {
            name: 'projectName',
            type: CommandArgumentTypeEnum.STRING,
            optional: true
        }
    ],
    execute: (_, projectName: string) => {
        if (!projectName) {
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
                type: CommandResultType.TABLE
            };
        }
    }
};