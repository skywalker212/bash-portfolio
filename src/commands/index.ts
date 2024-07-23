import { Command } from '@/types';
import { helpCommand } from './help';
import { whoamiCommand } from './whoami';
import { skillsCommand } from './skills';
import { projectsCommand } from './projects';
import { clearCommand } from './clear';
import { lsCommand } from './ls';
import { cdCommand } from './cd';
import { mkdirCommand } from './mkdir';

export const commands = [
    helpCommand,
    whoamiCommand,
    skillsCommand,
    projectsCommand,
    clearCommand,
    lsCommand,
    cdCommand,
    mkdirCommand
] as Command[];