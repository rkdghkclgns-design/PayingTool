import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, GameGenre, TargetMarket } from '../models';
import { saveProjectSnapshot, loadProjectSnapshot, deleteProjectSnapshot } from '../utils/project-snapshot';

const MAX_PROJECTS = 10;

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
    (set, get) => ({
      ...initialState,

      createProject: (
        name: string,
        genre: GameGenre,
        market: TargetMarket,
      ): Project => {
        const state = get();

        if (state.projects.length >= MAX_PROJECTS) {
          throw new Error(`프로젝트는 최대 ${MAX_PROJECTS}개까지 생성할 수 있습니다.`);
        }

        // Save current project snapshot before creating new one
        if (state.activeProjectId) {
          saveProjectSnapshot(state.activeProjectId);
        }

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

        set((s) => ({
          ...s,
          projects: [...s.projects, newProject],
          activeProjectId: newProject.id,
        }));

        // Load empty state for the new project
        loadProjectSnapshot(newProject.id);

        return newProject;
      },

      deleteProject: (id: string) => {
        // Delete the project's snapshot
        deleteProjectSnapshot(id);

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
        });

        // Load the new active project's snapshot
        const newActiveId = get().activeProjectId;
        if (newActiveId) {
          loadProjectSnapshot(newActiveId);
        }
      },

      switchProject: (id: string) => {
        const state = get();
        if (state.activeProjectId === id) return;

        // Save current project snapshot
        if (state.activeProjectId) {
          saveProjectSnapshot(state.activeProjectId);
        }

        set((s) => ({
          ...s,
          activeProjectId: id,
        }));

        // Load the target project's snapshot
        loadProjectSnapshot(id);
      },
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

export { MAX_PROJECTS };
