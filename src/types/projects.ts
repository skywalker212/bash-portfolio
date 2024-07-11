export interface Project {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link: string;
    date: string; // ISO date string
    image?: string;
}

export interface ProjectsState {
    projects: Project[];
}