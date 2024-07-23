import { Command, CommandResultType } from '@/types';

export const whoamiCommand: Command = {
    name: 'whoami',
    description: 'Display information about me',
    execute: () => {
        return [{
            content: [
                ['Name', 'Akash Gajjar'],
                ['Role', 'Software Engineer'],
                ['Education', 'M.S. in Computer Science, University of Florida'],
                ['Experience', '3+ years in software development'],
                ['Interests', 'Machine Learning, Web Development, Cyber Security']
            ],
            type: CommandResultType.TABLE
        },
        {
            content: (
                <div>
                    <p>Email: akashgajjar8@gmail.com</p>
                    <p>LinkedIn: <a href="https://www.linkedin.com/in/akashagajjar" target = "_blank" rel = "noopener noreferrer" className = "terminal-link" >linkedin.com/in/akashagajjar</a> </p>
                    <p>GitHub: <a href="https://github.com/skywalker212" target = "_blank" rel = "noopener noreferrer" className = "terminal-link" >github.com/skywalker212</a></p>
                </div>
            ),
            type: CommandResultType.CUSTOM
        }
        ];
    }
};