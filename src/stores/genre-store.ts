import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GenreState {
  readonly selectedGenre: string | null;
  readonly genreSource: 'manual' | 'mindmap';
}

interface GenreActions {
  setGenre: (genre: string, source: 'manual' | 'mindmap') => void;
  clearGenre: () => void;
}

type GenreStore = GenreState & GenreActions;

const initialState: GenreState = {
  selectedGenre: 'idle',
  genreSource: 'manual',
};

export const useGenreStore = create<GenreStore>()(
  persist(
    (set) => ({
      ...initialState,

      setGenre: (genre: string, source: 'manual' | 'mindmap') =>
        set(() => ({
          selectedGenre: genre,
          genreSource: source,
        })),

      clearGenre: () =>
        set(() => ({
          ...initialState,
        })),
    }),
    {
      name: 'paying-tool-genre',
    },
  ),
);
