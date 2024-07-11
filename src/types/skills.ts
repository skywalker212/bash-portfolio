export interface Skill {
    name: string;
    level: number; // 1-5
    category?: string;
}

export interface SkillsState {
    skills: Skill[];
}