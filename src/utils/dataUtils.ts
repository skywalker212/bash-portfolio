import { Project, Skill } from '@/types';

export const sortProjects = (projects: Project[], sortBy: 'name' | 'date' = 'date'): Project[] => {
  return [...projects].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });
};

export const filterSkills = (skills: Skill[], minLevel: number = 0): Skill[] => {
  return skills.filter(skill => skill.level >= minLevel);
};