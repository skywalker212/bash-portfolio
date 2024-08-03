import { Command } from '@/types';
import { helpCommand } from './help';
import { whoamiCommand } from './whoami';
import { skillsCommand } from './skills';
import { projectsCommand } from './projects';
import { clearCommand } from './clear';
import { lsCommand } from './ls';
import { cdCommand } from './cd';
import { mkdirCommand } from './mkdir';
import { catCommand } from './cat';
import { rmCommand } from './rm';
import { catsayCommand } from './catsay';

export const commands = [
    helpCommand,
    whoamiCommand,
    skillsCommand,
    projectsCommand,
    catsayCommand,
    clearCommand,
    lsCommand,
    cdCommand,
    mkdirCommand,
    rmCommand,
    catCommand
] as Command[];