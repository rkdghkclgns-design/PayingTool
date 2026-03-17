import type { UserSegment } from './product';

export interface MetricsConfig {
  readonly dau: number;
  readonly mau: number;
  readonly d1Retention: number;
  readonly d7Retention: number;
  readonly d30Retention: number;
  readonly arpdau: number;
  readonly arppu: number;
  readonly conversionRate: number;
  readonly cpi: number;
  readonly cpuKR: number;
  readonly cpuGlobal: number;
}

export interface SegmentMetrics {
  readonly segment: UserSegment;
  readonly userCount: number;
  readonly percentage: number;
  readonly avgSpend: number;
  readonly totalRevenue: number;
  readonly purchaseFrequency: number;
}

export interface MonthlyProjection {
  readonly month: number;
  readonly label: string;
  readonly dau: number;
  readonly revenue: number;
  readonly cumulativeRevenue: number;
  readonly payingUsers: number;
  readonly arpdau: number;
}

export interface RevenueSimulation {
  readonly monthlyProjections: readonly MonthlyProjection[];
  readonly totalRevenue: number;
  readonly totalMonths: number;
  readonly ltv: number;
  readonly paybackMonth: number | null;
  readonly peakRevenue: number;
  readonly peakMonth: number;
}
