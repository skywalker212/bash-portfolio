import { TerminalState } from './terminal';
import { ThemeState } from './theme';
import { SkillsState } from './skills';
import { ProjectsState } from './projects';

export interface RootState {
    terminal: TerminalState;
    theme: ThemeState;
    skills: SkillsState;
    projects: ProjectsState;
}