import { Command } from '@/types';
import { helpCommand } from './help';
import { aboutCommand } from './about';
import { skillsCommand } from './skills';
import { projectsCommand } from './projects';
import { contactCommand } from './contact';
import { clearCommand } from './clear';
import { cowsayCommand } from './cowsay';

export const commands: Command[] = [
    helpCommand,
    aboutCommand,
    skillsCommand,
    projectsCommand,
    contactCommand,
    clearCommand,
    cowsayCommand
];