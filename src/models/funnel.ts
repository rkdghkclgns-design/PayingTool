export type FunnelStageName =
  | 'awareness'
  | 'first_session'
  | 'tutorial_complete'
  | 'core_loop_engaged'
  | 'first_purchase_prompt'
  | 'first_purchase'
  | 'repeat_purchase'
  | 'subscription_or_vip';

export interface FunnelStage {
  readonly id: string;
  readonly name: FunnelStageName | string;
  readonly label: string;
  readonly order: number;
  readonly conversionRate: number;
  readonly assignedProductIds: readonly string[];
  readonly description: string;
}

export interface FunnelConfig {
  readonly stages: readonly FunnelStage[];
  readonly totalUsers: number;
  readonly period: 'daily' | 'weekly' | 'monthly';
}
