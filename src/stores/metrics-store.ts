import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MetricsConfig } from '../models';

interface MetricsState {
  readonly config: MetricsConfig;
}

interface MetricsActions {
  updateMetric: <K extends keyof MetricsConfig>(
    key: K,
    value: MetricsConfig[K],
  ) => void;
  resetConfig: () => void;
}

type MetricsStore = MetricsState & MetricsActions;

const defaultConfig: MetricsConfig = {
  dau: 10000,
  mau: 100000,
  d1Retention: 0.4,
  d7Retention: 0.2,
  d30Retention: 0.08,
  arpdau: 0.15,
  arppu: 12.0,
  conversionRate: 0.03,
  cpi: 2.5,
  cpuKR: 3.0,
  cpuGlobal: 2.0,
  targetLtv: 5.0,
  targetArpu: 0.50,
  targetConversion: 0.05,
  targetD1Retention: 0.45,
  targetD7Retention: 0.25,
  targetD30Retention: 0.10,
};

const initialState: MetricsState = {
  config: defaultConfig,
};

export const useMetricsStore = create<MetricsStore>()(
  persist(
    (set) => ({
      ...initialState,

      updateMetric: <K extends keyof MetricsConfig>(
        key: K,
        value: MetricsConfig[K],
      ) =>
        set((state) => ({
          ...state,
          config: {
            ...state.config,
            [key]: value,
          },
        })),

      resetConfig: () =>
        set(() => ({
          config: defaultConfig,
        })),
    }),
    {
      name: 'paying-tool-metrics',
      partialize: (state) => ({
        config: state.config,
      }),
    },
  ),
);
