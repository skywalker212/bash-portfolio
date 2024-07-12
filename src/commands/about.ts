import { Command, CommandResultType } from '@/types';

export const aboutCommand: Command = {
    name: 'about',
    description: 'Display information about me',
    execute: () => {
        return {
            content: [
                ['Name', 'Akash Gajjar'],
                ['Role', 'Software Engineer'],
                ['Education', 'M.S. in Computer Science, University of Florida'],
                ['Experience', '3+ years in software development'],
                ['Interests', 'Machine Learning, Web Development, Cyber Security']
            ],
            type: CommandResultType.TABLE
        };
    }
};