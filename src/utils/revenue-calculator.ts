import type { MetricsConfig, RevenueSimulation, MonthlyProjection } from '../models';

/**
 * Simulate revenue projections over a given number of months.
 * Uses retention decay to model DAU decline and revenue over time.
 */
export function simulateRevenue(
  config: MetricsConfig,
  months: number,
): RevenueSimulation {
  const projections: MonthlyProjection[] = [];
  let cumulativeRevenue = 0;
  let peakRevenue = 0;
  let peakMonth = 1;
  let paybackMonth: number | null = null;

  const totalAcquisitionCost = config.dau * config.cpi;

  for (let month = 1; month <= months; month++) {
    const retentionFactor = estimateRetentionAtMonth(
      month,
      config.d1Retention,
      config.d7Retention,
      config.d30Retention,
    );

    const dau = Math.round(config.dau * retentionFactor);
    const payingUsers = Math.round(dau * config.conversionRate);
    const monthlyRevenue = dau * config.arpdau * 30;
    const currentArpdau = dau > 0 ? monthlyRevenue / (dau * 30) : 0;

    cumulativeRevenue += monthlyRevenue;

    if (monthlyRevenue > peakRevenue) {
      peakRevenue = monthlyRevenue;
      peakMonth = month;
    }

    if (paybackMonth === null && cumulativeRevenue >= totalAcquisitionCost) {
      paybackMonth = month;
    }

    const projection: MonthlyProjection = {
      month,
      label: `M${month}`,
      dau,
      revenue: Math.round(monthlyRevenue),
      cumulativeRevenue: Math.round(cumulativeRevenue),
      payingUsers,
      arpdau: Number(currentArpdau.toFixed(4)),
    };

    projections.push(projection);
  }

  const monthlyProjections: readonly MonthlyProjection[] = projections;

  const ltv = calculateLtv(
    config.arpdau,
    config.d1Retention,
    config.d7Retention,
    config.d30Retention,
  );

  return {
    monthlyProjections,
    totalRevenue: Math.round(cumulativeRevenue),
    totalMonths: months,
    ltv,
    paybackMonth,
    peakRevenue: Math.round(peakRevenue),
    peakMonth,
  };
}

/**
 * Estimate retention rate at a given month using logarithmic decay
 * interpolated from D1, D7, and D30 retention data points.
 */
function estimateRetentionAtMonth(
  month: number,
  d1: number,
  d7: number,
  d30: number,
): number {
  const day = month * 30;

  if (day <= 1) return 1;
  if (day <= 7) {
    const t = (day - 1) / (7 - 1);
    return 1 - t * (1 - d1) + t * (d1 - d7) * (t - 1);
  }
  if (day <= 30) {
    const t = (day - 7) / (30 - 7);
    return d7 - t * (d7 - d30);
  }

  // Beyond D30: exponential decay based on D30 trend
  const dailyDecayRate = d30 > 0 ? Math.pow(d30, 1 / 30) : 0.95;
  return d30 * Math.pow(dailyDecayRate, day - 30);
}

/**
 * Calculate Lifetime Value using retention-based integration.
 * Approximates the area under the retention curve multiplied by ARPDAU.
 */
export function calculateLtv(
  arpdau: number,
  d1: number,
  d7: number,
  d30: number,
): number {
  // Integrate retention over 365 days using trapezoidal approximation
  const days = 365;
  let totalRetentionDays = 0;

  for (let day = 1; day <= days; day++) {
    const month = day / 30;
    const retention = estimateRetentionAtMonth(month, d1, d7, d30);
    totalRetentionDays += retention;
  }

  return Number((arpdau * totalRetentionDays).toFixed(2));
}

/**
 * Calculate the payback period in days given CPI and ARPDAU.
 * Returns the number of days needed for cumulative ARPDAU to exceed CPI.
 */
export function calculatePaybackPeriod(cpi: number, arpdau: number): number {
  if (arpdau <= 0) return Infinity;
  return Math.ceil(cpi / arpdau);
}
