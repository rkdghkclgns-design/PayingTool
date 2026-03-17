export interface GenreBenchmark {
  readonly genre: string;
  readonly genreKo: string;
  readonly d1Retention: { readonly low: number; readonly median: number; readonly high: number };
  readonly d7Retention: { readonly low: number; readonly median: number; readonly high: number };
  readonly d30Retention: { readonly low: number; readonly median: number; readonly high: number };
  readonly conversionRate: { readonly low: number; readonly median: number; readonly high: number };
  readonly arpdau: { readonly low: number; readonly median: number; readonly high: number };
  readonly arppu: { readonly low: number; readonly median: number; readonly high: number };
  readonly sessionLength: number;
  readonly stickiness: number;
}

export const GENRE_BENCHMARKS: readonly GenreBenchmark[] = [
  {
    genre: 'hyper_casual',
    genreKo: '하이퍼캐주얼',
    d1Retention: { low: 30, median: 40, high: 50 },
    d7Retention: { low: 8, median: 15, high: 22 },
    d30Retention: { low: 2, median: 5, high: 8 },
    conversionRate: { low: 0.5, median: 1.5, high: 3.0 },
    arpdau: { low: 0.02, median: 0.05, high: 0.12 },
    arppu: { low: 2, median: 5, high: 12 },
    sessionLength: 4,
    stickiness: 12,
  },
  {
    genre: 'casual_puzzle',
    genreKo: '캐주얼 퍼즐',
    d1Retention: { low: 35, median: 42, high: 52 },
    d7Retention: { low: 12, median: 18, high: 28 },
    d30Retention: { low: 4, median: 8, high: 14 },
    conversionRate: { low: 1.5, median: 3.5, high: 7.0 },
    arpdau: { low: 0.03, median: 0.08, high: 0.20 },
    arppu: { low: 5, median: 12, high: 30 },
    sessionLength: 7,
    stickiness: 18,
  },
  {
    genre: 'rpg',
    genreKo: 'RPG',
    d1Retention: { low: 28, median: 38, high: 48 },
    d7Retention: { low: 10, median: 18, high: 28 },
    d30Retention: { low: 4, median: 8, high: 15 },
    conversionRate: { low: 2.0, median: 5.0, high: 10.0 },
    arpdau: { low: 0.05, median: 0.15, high: 0.45 },
    arppu: { low: 10, median: 30, high: 80 },
    sessionLength: 15,
    stickiness: 22,
  },
  {
    genre: 'slg_strategy',
    genreKo: 'SLG/전략',
    d1Retention: { low: 25, median: 35, high: 45 },
    d7Retention: { low: 10, median: 16, high: 25 },
    d30Retention: { low: 5, median: 10, high: 18 },
    conversionRate: { low: 3.0, median: 6.0, high: 12.0 },
    arpdau: { low: 0.08, median: 0.22, high: 0.60 },
    arppu: { low: 15, median: 45, high: 120 },
    sessionLength: 18,
    stickiness: 25,
  },
  {
    genre: 'mmorpg',
    genreKo: 'MMORPG',
    d1Retention: { low: 30, median: 40, high: 50 },
    d7Retention: { low: 12, median: 22, high: 32 },
    d30Retention: { low: 6, median: 12, high: 20 },
    conversionRate: { low: 3.5, median: 7.0, high: 14.0 },
    arpdau: { low: 0.10, median: 0.30, high: 0.80 },
    arppu: { low: 20, median: 55, high: 150 },
    sessionLength: 25,
    stickiness: 30,
  },
  {
    genre: 'sports',
    genreKo: '스포츠',
    d1Retention: { low: 25, median: 33, high: 42 },
    d7Retention: { low: 8, median: 14, high: 22 },
    d30Retention: { low: 3, median: 6, high: 12 },
    conversionRate: { low: 1.5, median: 3.5, high: 7.0 },
    arpdau: { low: 0.03, median: 0.10, high: 0.28 },
    arppu: { low: 8, median: 22, high: 55 },
    sessionLength: 12,
    stickiness: 20,
  },
  {
    genre: 'social_casino',
    genreKo: '소셜카지노',
    d1Retention: { low: 28, median: 36, high: 45 },
    d7Retention: { low: 10, median: 17, high: 26 },
    d30Retention: { low: 5, median: 9, high: 16 },
    conversionRate: { low: 2.5, median: 5.5, high: 11.0 },
    arpdau: { low: 0.06, median: 0.18, high: 0.50 },
    arppu: { low: 12, median: 35, high: 95 },
    sessionLength: 14,
    stickiness: 22,
  },
  {
    genre: 'idle',
    genreKo: '아이들',
    d1Retention: { low: 32, median: 42, high: 52 },
    d7Retention: { low: 10, median: 18, high: 25 },
    d30Retention: { low: 3, median: 7, high: 13 },
    conversionRate: { low: 1.0, median: 2.5, high: 5.0 },
    arpdau: { low: 0.02, median: 0.06, high: 0.15 },
    arppu: { low: 4, median: 10, high: 25 },
    sessionLength: 5,
    stickiness: 15,
  },
] as const;
