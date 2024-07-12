import { Command, CommandResultType } from '../types';

export const contactCommand: Command = {
    name: 'contact',
    description: 'Display my contact information',
    execute: () => {
        return {
            content: (
                <div>
                    <p>Email: akashgajjar8@gmail.com</p>
                    <p>LinkedIn: <a href="https://www.linkedin.com/in/akashagajjar" target = "_blank" rel = "noopener noreferrer" className = "terminal-link" >linkedin.com/in/akashagajjar</a> </p>
                    <p>GitHub: <a href="https://github.com/skywalker212" target = "_blank" rel = "noopener noreferrer" className = "terminal-link" >github.com/skywalker212</a></p>
                </div>
            ),
            type: CommandResultType.CUSTOM
        };
    }
};