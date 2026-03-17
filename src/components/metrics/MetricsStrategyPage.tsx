import { useState } from 'react';
import PageContainer from '../layout/PageContainer';
import Tabs from '../ui/Tabs';
import RevenueSimulator from './RevenueSimulator';
import ArpuDefensePanel from './ArpuDefensePanel';
import SegmentTargetingPanel from './SegmentTargetingPanel';

const TABS = [
  { id: 'simulator', label: '수익 시뮬레이션' },
  { id: 'arpu-defense', label: 'ARPU 방어 전략' },
  { id: 'segment', label: '세그먼트 분석' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function MetricsStrategyPage() {
  const [activeTab, setActiveTab] = useState<TabId>('simulator');

  return (
    <PageContainer
      title="지표 전략"
      description="핵심 성과 지표(KPI) 시뮬레이션과 ARPU 방어 전략을 수립합니다."
    >
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
