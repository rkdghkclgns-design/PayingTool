import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FunnelStage, FunnelStageName } from '../models';
import { FUNNEL_STAGE_LABELS, DEFAULT_CONVERSION_RATES } from '../utils/constants';

interface FunnelState {
  readonly stages: readonly FunnelStage[];
}

interface FunnelActions {
  updateStage: (
    id: string,
    updates: Partial<Pick<FunnelStage, 'conversionRate' | 'description' | 'label'>>,
  ) => void;
  addStage: (label: string, description: string) => void;
  removeStage: (id: string) => void;
  reorderStages: (fromIndex: number, toIndex: number) => void;
  updateStageLabel: (id: string, label: string) => void;
  updateStageDescription: (id: string, description: string) => void;
  assignProduct: (stageId: string, productId: string) => void;
  removeProduct: (stageId: string, productId: string) => void;
  resetStages: () => void;
}

type FunnelStore = FunnelState & FunnelActions;

function generateStageId(name: FunnelStageName): string {
  return `funnel_${name}`;
}

function generateCustomStageId(): string {
  return `funnel_custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultStages(): readonly FunnelStage[] {
  const stageNames: readonly FunnelStageName[] = [
    'awareness',
    'first_session',
    'tutorial_complete',
    'core_loop_engaged',
    'first_purchase_prompt',
    'first_purchase',
    'repeat_purchase',
    'subscription_or_vip',
  ];

  return stageNames.map((name, index) => ({
    id: generateStageId(name),
    name,
    label: FUNNEL_STAGE_LABELS.get(name) ?? name,
    order: index,
    conversionRate: DEFAULT_CONVERSION_RATES[name],
    assignedProductIds: [],
    description: '',
  }));
}

function recalculateOrder(stages: readonly FunnelStage[]): readonly FunnelStage[] {
  return stages.map((stage, index) => ({
    ...stage,
    order: index,
  }));
}

const initialState: FunnelState = {
  stages: createDefaultStages(),
};

export const useFunnelStore = create<FunnelStore>()(
  persist(
    (set) => ({
      ...initialState,

      updateStage: (
        id: string,
        updates: Partial<Pick<FunnelStage, 'conversionRate' | 'description' | 'label'>>,
      ) =>
        set((state) => ({
          ...state,
          stages: state.stages.map((stage) =>
            stage.id === id ? { ...stage, ...updates } : stage,
          ),
        })),

      addStage: (label: string, description: string) =>
        set((state) => {
          const newStage: FunnelStage = {
            id: generateCustomStageId(),
            name: `custom_${Date.now()}`,
            label,
            order: state.stages.length,
            conversionRate: 0.5,
            assignedProductIds: [],
            description,
          };
          return {
            ...state,
            stages: [...state.stages, newStage],
          };
        }),

      removeStage: (id: string) =>
        set((state) => {
          if (state.stages.length <= 2) {
            return state;
          }
          const filtered = state.stages.filter((stage) => stage.id !== id);
          return {
            ...state,
            stages: recalculateOrder(filtered),
          };
        }),

      reorderStages: (fromIndex: number, toIndex: number) =>
        set((state) => {
          if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= state.stages.length ||
            toIndex >= state.stages.length ||
            fromIndex === toIndex
          ) {
            return state;
          }
          const mutableStages = [...state.stages];
          const [moved] = mutableStages.splice(fromIndex, 1);
          mutableStages.splice(toIndex, 0, moved);
          return {
            ...state,
            stages: recalculateOrder(mutableStages),
          };
        }),

      updateStageLabel: (id: string, label: string) =>
        set((state) => ({
          ...state,
          stages: state.stages.map((stage) =>
            stage.id === id ? { ...stage, label } : stage,
          ),
        })),

      updateStageDescription: (id: string, description: string) =>
        set((state) => ({
          ...state,
          stages: state.stages.map((stage) =>
            stage.id === id ? { ...stage, description } : stage,
          ),
        })),

      assignProduct: (stageId: string, productId: string) =>
        set((state) => ({
          ...state,
          stages: state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;
            if (stage.assignedProductIds.includes(productId)) return stage;
            return {
              ...stage,
              assignedProductIds: [...stage.assignedProductIds, productId],
            };
          }),
        })),

      removeProduct: (stageId: string, productId: string) =>
        set((state) => ({
          ...state,
          stages: state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;
            return {
              ...stage,
              assignedProductIds: stage.assignedProductIds.filter(
                (id) => id !== productId,
              ),
            };
          }),
        })),

      resetStages: () =>
        set(() => ({
          stages: createDefaultStages(),
        })),
    }),
    {
      name: 'paying-tool-funnel',
      partialize: (state) => ({
        stages: state.stages,
      }),
    },
  ),
);
