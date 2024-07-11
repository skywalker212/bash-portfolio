import { create } from 'zustand'
import { ProjectsState, Project } from '@/types'

interface ProjectsStore extends ProjectsState {
  addProject: (project: Project) => void
  removeProject: (projectId: string) => void
  updateProject: (projectId: string, updatedProject: Partial<Project>) => void
}

export const useProjectsStore = create<ProjectsStore>((set) => ({
  projects: [
    {
      id: '1',
      name: 'Terminal Portfolio',
      description: 'A terminal-style portfolio website built with Next.js and TypeScript',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand'],
      link: 'https://github.com/yourusername/terminal-portfolio',
      date: '2024-07-11',
    }
  ],
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  removeProject: (projectId) => set((state) => ({
    projects: state.projects.filter((project) => project.id !== projectId),
  })),
  updateProject: (projectId, updatedProject) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === projectId ? { ...project, ...updatedProject } : project
    ),
  })),
}))