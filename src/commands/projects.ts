import { Command } from '@/types';

export const projectsCommand: Command = {
    name: 'projects',
    description: 'Display my notable projects',
    execute: () => {
        return {
            content: [
                ['Project', 'Description', 'Technologies'],
                ['Terminal Portfolio', 'This website', 'Next.js, TypeScript, Tailwind CSS'],
                ['Infosys Equinox Studio', 'Web application development platform', 'Node.js, React'],
                ['Tweeter', 'Twitter clone', 'Erlang'],
                ['Shadowfax', 'Distributed system project', 'Java'],
                ['HPA Classification', 'Machine learning project', 'Python, TensorFlow']
            ],
            type: 'table'
        };
    }
};