/**
 * Format a number as Korean Won currency.
 * Example: 1234 -> "₩1,234"
 */
export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

/**
 * Format a number as US Dollar currency.
 * Example: 9.99 -> "$9.99"
 */
export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a decimal value as a percentage string.
 * Example: 0.1234 -> "12.34%"
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * Format a number with comma separators.
 * Example: 1234567 -> "1,234,567"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * Format price as "원화(달러)" combined format.
 * Example: formatPrice(1350, 0.99) -> "₩1,350 ($0.99)"
 */
export function formatPrice(krw: number, usd: number): string {
  return `${formatKRW(krw)} (${formatUSD(usd)})`;
}

/**
 * Format product price — shows "무료" for free products (0원).
 * Use only for product prices, not for revenue/metrics.
 */
export function formatProductPrice(krw: number, usd: number): string {
  if (krw === 0 && usd === 0) return '무료';
  return formatPrice(krw, usd);
}

/**
 * Format a number in compact notation.
 * Examples: 1200 -> "1.2K", 1500000 -> "1.5M", 2000000000 -> "2.0B"
 */
export function formatCompactNumber(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(1)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(1)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(1)}K`;
  }
  return `${sign}${absValue.toFixed(0)}`;
}
