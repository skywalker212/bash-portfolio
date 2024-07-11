import { Command } from '@/types';
import { helpCommand } from './help';
import { aboutCommand } from './about';
import { skillsCommand } from './skills';
import { projectsCommand } from './projects';
import { contactCommand } from './contact';
import { clearCommand } from './clear';

export const commands: Command[] = [
    helpCommand,
    aboutCommand,
    skillsCommand,
    projectsCommand,
    contactCommand,
    clearCommand,
];