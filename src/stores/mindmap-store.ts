import { create } from 'zustand';
import type { GameStructure } from '../models';

interface MindmapState {
  readonly uploadedImage: string | null;
  readonly isAnalyzing: boolean;
  readonly analysisResult: GameStructure | null;
  readonly analysisError: string | null;
}

interface MindmapActions {
  setUploadedImage: (base64: string | null) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisResult: (result: GameStructure) => void;
  setAnalysisError: (error: string) => void;
  clearAnalysis: () => void;
}

type MindmapStore = MindmapState & MindmapActions;

const initialState: MindmapState = {
  uploadedImage: null,
  isAnalyzing: false,
  analysisResult: null,
  analysisError: null,
};

export const useMindmapStore = create<MindmapStore>()((set) => ({
  ...initialState,

  setUploadedImage: (base64: string | null) =>
    set((state) => ({
      ...state,
      uploadedImage: base64,
      analysisResult: null,
      analysisError: null,
    })),

  setAnalyzing: (isAnalyzing: boolean) =>
    set((state) => ({
      ...state,
      isAnalyzing,
    })),

  setAnalysisResult: (result: GameStructure) =>
    set((state) => ({
      ...state,
      analysisResult: result,
      isAnalyzing: false,
      analysisError: null,
    })),

  setAnalysisError: (error: string) =>
    set((state) => ({
      ...state,
      analysisError: error,
      isAnalyzing: false,
    })),

  clearAnalysis: () =>
    set(() => ({
      ...initialState,
    })),
}));
