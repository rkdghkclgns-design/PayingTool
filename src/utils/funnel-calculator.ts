import type { FunnelStage, FunnelStageName } from '../models';
import { DEFAULT_CONVERSION_RATES } from './constants';

export interface FunnelFlowResult {
  readonly stage: string;
  readonly name: FunnelStageName;
  readonly users: number;
  readonly revenue: number;
  readonly conversionRate: number;
  readonly dropoff: number;
}

/**
 * Calculate user flow through the funnel stages.
 * Each stage reduces the user count by its conversion rate.
 * Revenue is estimated based on paying-related stages.
 */
export function calculateFunnelFlow(
  stages: readonly FunnelStage[],
  totalUsers: number,
): readonly FunnelFlowResult[] {
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  let currentUsers = totalUsers;
  const results: FunnelFlowResult[] = [];

  for (const stage of sortedStages) {
    const usersAtStage = Math.round(currentUsers * stage.conversionRate);
    const dropoff = currentUsers - usersAtStage;

    const revenue = estimateStageRevenue(stage.name, usersAtStage);

    const result: FunnelFlowResult = {
      stage: stage.label,
      name: stage.name,
      users: usersAtStage,
      revenue: Math.round(revenue),
      conversionRate: stage.conversionRate,
      dropoff,
    };

    results.push(result);
    currentUsers = usersAtStage;
  }

  return results;
}

/**
 * Estimate revenue contribution for a funnel stage based on stage type.
 */
function estimateStageRevenue(
  stageName: FunnelStageName,
  users: number,
): number {
  const avgSpendByStage: Partial<Record<FunnelStageName, number>> = {
    first_purchase: 1200,
    repeat_purchase: 5500,
    subscription_or_vip: 15000,
  };

  const avgSpend = avgSpendByStage[stageName];
  if (avgSpend === undefined) return 0;

  return users * avgSpend;
}

/**
 * Identify the funnel stage with the largest gap between current
 * conversion and benchmark conversion rate.
 * Returns null if no significant bottleneck is found.
 */
export function suggestBottleneck(
  stages: readonly FunnelStage[],
  benchmarks?: Partial<Record<FunnelStageName, number>>,
): FunnelStageName | null {
  const benchmarkRates = benchmarks ?? DEFAULT_CONVERSION_RATES;

  let worstGap = 0;
  let worstStage: FunnelStageName | null = null;

  for (const stage of stages) {
    const benchmark = benchmarkRates[stage.name];
    if (benchmark === undefined) continue;

    const gap = benchmark - stage.conversionRate;
    if (gap > worstGap) {
      worstGap = gap;
      worstStage = stage.name;
    }
  }

  // Only flag a bottleneck if the gap is significant (>5%)
  if (worstGap < 0.05) return null;

  return worstStage;
}
