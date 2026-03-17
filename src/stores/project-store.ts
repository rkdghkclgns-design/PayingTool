import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, GameGenre, TargetMarket } from '../models';

interface ProjectState {
  readonly projects: readonly Project[];
  readonly activeProjectId: string | null;
}

interface ProjectActions {
  createProject: (
    name: string,
    genre: GameGenre,
    market: TargetMarket,
  ) => Project;
  deleteProject: (id: string) => void;
  switchProject: (id: string) => void;
}

type ProjectStore = ProjectState & ProjectActions;

const initialState: ProjectState = {
  projects: [],
  activeProjectId: null,
};

function generateId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      ...initialState,

      createProject: (
        name: string,
        genre: GameGenre,
        market: TargetMarket,
      ): Project => {
        const now = new Date().toISOString();
        const newProject: Project = {
          id: generateId(),
          name,
          description: '',
          gameGenre: genre,
          targetMarket: market,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          ...state,
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
        }));

        return newProject;
      },

      deleteProject: (id: string) =>
        set((state) => {
          const filteredProjects = state.projects.filter((p) => p.id !== id);
          const newActiveId =
            state.activeProjectId === id
              ? (filteredProjects[0]?.id ?? null)
              : state.activeProjectId;

          return {
            ...state,
            projects: filteredProjects,
            activeProjectId: newActiveId,
          };
        }),

      switchProject: (id: string) =>
        set((state) => ({
          ...state,
          activeProjectId: id,
        })),
    }),
    {
      name: 'paying-tool-projects',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    },
  ),
);
