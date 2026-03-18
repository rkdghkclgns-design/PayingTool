import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { BarChart3, Sparkles } from 'lucide-react';
import type { GameGenre } from '../../models/project';
import { useGenreStore } from '../../stores/genre-store';
import { useMetricsStore } from '../../stores/metrics-store';
import { getGenreBlueprint } from '../../data/genre-blueprints/index';
import { GAME_GENRE_LABELS } from '../../utils/constants';
import PageContainer from '../layout/PageContainer';
import Tabs from '../ui/Tabs';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import RevenueSimulator from './RevenueSimulator';
import ArpuDefensePanel from './ArpuDefensePanel';
import SegmentTargetingPanel from './SegmentTargetingPanel';

const TABS = [
  { id: 'simulator', label: '수익 시뮬레이션' },
  { id: 'arpu-defense', label: 'ARPU 방어 전략' },
  { id: 'segment', label: '세그먼트 분석' },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ─────────────────────────────────────────────
// Genre Benchmark Panel
// ─────────────────────────────────────────────
function GenreBenchmarkPanel() {
  const selectedGenre = useGenreStore((s) => s.selectedGenre);
  const genreSource = useGenreStore((s) => s.genreSource);
  const currentConfig = useMetricsStore((s) => s.config);
  const loadConfig = useMetricsStore((s) => s.loadConfig);
  const [applied, setApplied] = useState(false);

  const blueprint = useMemo(
    () => (selectedGenre ? getGenreBlueprint(selectedGenre as GameGenre) : undefined),
    [selectedGenre],
  );

  const genreLabel = selectedGenre
    ? GAME_GENRE_LABELS.get(selectedGenre as GameGenre) ?? selectedGenre
    : null;

  const applyBenchmarks = useCallback(() => {
    if (!blueprint?.benchmarkKpis) return;
    const kpis = blueprint.benchmarkKpis;

    // 한 번에 반영 — 개별 updateMetric 12회 호출 대신 loadConfig 1회로 안정적 반영
    loadConfig({
      ...currentConfig,
      // 현재 지표: median 기반
      conversionRate: kpis.conversionRate.median / 100,
      arpdau: kpis.arpdau.median,
      arppu: kpis.arppu.median,
      d1Retention: kpis.d1Retention.median / 100,
      d7Retention: kpis.d7Retention.median / 100,
      d30Retention: kpis.d30Retention.median / 100,
      // 목표 KPI: high 값 기반
      targetConversion: kpis.conversionRate.high / 100,
      targetD1Retention: kpis.d1Retention.high / 100,
      targetD7Retention: kpis.d7Retention.high / 100,
      targetD30Retention: kpis.d30Retention.high / 100,
      targetArpu: kpis.arpdau.high,
      targetLtv: Math.round(kpis.arpdau.high * 30 * 100) / 100,
    });
  }, [blueprint, currentConfig, loadConfig]);

  // 장르 변경 시 자동으로 KPI 벤치마크 적용
  const prevGenreRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedGenre && selectedGenre !== prevGenreRef.current) {
      applyBenchmarks();
    }
    prevGenreRef.current = selectedGenre;
  }, [selectedGenre, applyBenchmarks]);

  const handleApplyBenchmarks = useCallback(() => {
    applyBenchmarks();
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  }, [applyBenchmarks]);

  if (!selectedGenre || !blueprint?.benchmarkKpis) {
    return (
      <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            장르 설계도에서 장르를 선택하면 KPI 벤치마크가 자동 적용됩니다
          </p>
        </div>
      </div>
    );
  }

  const kpis = blueprint.benchmarkKpis;

  return (
    <div className="mb-6 p-4 rounded-xl bg-brand-50 border border-brand-200 dark:bg-brand-950 dark:border-brand-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            {genreLabel} 장르 KPI 벤치마크
          </span>
          {genreSource === 'mindmap' && (
            <Badge variant="primary" size="sm">AI 감지</Badge>
          )}
        </div>
        <Button
          variant={applied ? 'secondary' : 'primary'}
          size="sm"
          onClick={handleApplyBenchmarks}
          icon={<Sparkles className="w-3.5 h-3.5" />}
        >
          {applied ? '적용 완료!' : '벤치마크 적용'}
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: '전환율', value: `${kpis.conversionRate.median}%`, range: `${kpis.conversionRate.low}~${kpis.conversionRate.high}%` },
          { label: 'ARPDAU', value: `$${kpis.arpdau.median.toFixed(2)}`, range: `$${kpis.arpdau.low.toFixed(2)}~${kpis.arpdau.high.toFixed(2)}` },
          { label: 'ARPPU', value: `$${kpis.arppu.median.toFixed(0)}`, range: `$${kpis.arppu.low.toFixed(0)}~${kpis.arppu.high.toFixed(0)}` },
          { label: 'D1 리텐션', value: `${kpis.d1Retention.median}%`, range: `${kpis.d1Retention.low}~${kpis.d1Retention.high}%` },
          { label: 'D7 리텐션', value: `${kpis.d7Retention.median}%`, range: `${kpis.d7Retention.low}~${kpis.d7Retention.high}%` },
          { label: 'D30 리텐션', value: `${kpis.d30Retention.median}%`, range: `${kpis.d30Retention.low}~${kpis.d30Retention.high}%` },
        ].map((item) => (
          <div key={item.label} className="text-center p-2 rounded-lg bg-white dark:bg-gray-900">
            <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
            <div className="text-sm font-bold text-brand-700 dark:text-brand-300">{item.value}</div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">{item.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MetricsStrategyPage() {
  const [activeTab, setActiveTab] = useState<TabId>('simulator');

  return (
    <PageContainer
      title="지표 전략"
      description="핵심 성과 지표(KPI) 시뮬레이션과 ARPU 방어 전략을 수립합니다."
      exportId="page-metrics"
      exportName="지표전략"
    >
      {/* Genre Benchmark Panel */}
      <GenreBenchmarkPanel />

      <Tabs
        tabs={[...TABS]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />
      <div className="mt-6">
        {activeTab === 'simulator' && <RevenueSimulator />}
        {activeTab === 'arpu-defense' && <ArpuDefensePanel />}
        {activeTab === 'segment' && <SegmentTargetingPanel />}
      </div>
    </PageContainer>
  );
}
