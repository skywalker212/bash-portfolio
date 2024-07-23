import { Command, CommandArgumentTypeEnum, CommandResult, CommandResultType, Project, TableCommandResult, TableType } from '@/types';
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
    args: {
        optional: [
            {
                name: 'project_name',
                type: CommandArgumentTypeEnum.STRING
            }
        ]
    },
    execute: (_, projectName: string): CommandResult | TableCommandResult => {
        if (!projectName) {
            return {
                content: [
                    ['Project', 'Technologies', 'Description'],
                    ...Object.values(projects).map(project => [
                        project.name,
                        project.technologies.join(', '),
                        project.description
                    ])
                ],
                type: CommandResultType.TABLE,
                tableType: TableType.NORMAL,
                columns: [{width: 20}, {width: 30}, {width: 50}]
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
                type: CommandResultType.TABLE,
                columns: [{width: 15}, {width: 55}]
            };
        }
    }
};