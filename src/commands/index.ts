import { Command } from '@/types';
import { helpCommand } from './help';
import { aboutCommand } from './about';
import { skillsCommand } from './skills';
import { projectsCommand } from './projects';
import { contactCommand } from './contact';
import { clearCommand } from './clear';
import { helloWasmCommand } from './hello-wasm';
import { vimCommand } from './vim';

export const commands = [
    helpCommand,
    aboutCommand,
    skillsCommand,
    projectsCommand,
    contactCommand,
    clearCommand,
    helloWasmCommand,
    vimCommand
] as Command[];