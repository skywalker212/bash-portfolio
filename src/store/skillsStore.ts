import { create } from 'zustand'
import { SkillsState, Skill } from '@/types'

interface SkillsStore extends SkillsState {
  addSkill: (skill: Skill) => void
  removeSkill: (skillName: string) => void
  updateSkill: (skillName: string, newLevel: number) => void
}

export const useSkillsStore = create<SkillsStore>((set) => ({
  skills: [
    { name: 'JavaScript', level: 5 },
    { name: 'TypeScript', level: 4 },
    { name: 'React', level: 5 },
    { name: 'Node.js', level: 4 },
    { name: 'Python', level: 3 },
  ],
  addSkill: (skill) => set((state) => ({ skills: [...state.skills, skill] })),
  removeSkill: (skillName) => set((state) => ({
    skills: state.skills.filter((skill) => skill.name !== skillName),
  })),
  updateSkill: (skillName, newLevel) => set((state) => ({
    skills: state.skills.map((skill) =>
      skill.name === skillName ? { ...skill, level: newLevel } : skill
    ),
  })),
}))