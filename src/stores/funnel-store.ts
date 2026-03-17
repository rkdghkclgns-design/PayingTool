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
    updates: Partial<Pick<FunnelStage, 'conversionRate' | 'description'>>,
  ) => void;
  assignProduct: (stageId: string, productId: string) => void;
  removeProduct: (stageId: string, productId: string) => void;
  resetStages: () => void;
}

type FunnelStore = FunnelState & FunnelActions;

function generateStageId(name: FunnelStageName): string {
  return `funnel_${name}`;
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

const initialState: FunnelState = {
  stages: createDefaultStages(),
};

export const useFunnelStore = create<FunnelStore>()(
  persist(
    (set) => ({
      ...initialState,

      updateStage: (
        id: string,
        updates: Partial<Pick<FunnelStage, 'conversionRate' | 'description'>>,
      ) =>
        set((state) => ({
          ...state,
          stages: state.stages.map((stage) =>
            stage.id === id ? { ...stage, ...updates } : stage,
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
