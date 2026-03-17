import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutDashboard, Brain, Target, Coins, Repeat, ArrowRight } from 'lucide-react';
import type { GameGenre, TargetMarket } from '../../models';
import { useProjectStore } from '../../stores/project-store';
import { useMindmapStore } from '../../stores/mindmap-store';
import { GAME_GENRE_LABELS, TARGET_MARKET_LABELS } from '../../utils/constants';
import PageContainer from '../layout/PageContainer';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import ProjectSummaryCard from './ProjectSummaryCard';
import RevenueProjectionCard from './RevenueProjectionCard';
import QuickActions from './QuickActions';

// ─────────────────────────────────────────────
// Game Analysis Status Card
// ─────────────────────────────────────────────
function GameAnalysisStatusCard() {
  const analysisResult = useMindmapStore((s) => s.analysisResult);
  const navigate = useNavigate();

  if (!analysisResult) {
    return (
      <Card className="lg:col-span-2">
        <button
          type="button"
          onClick={() => navigate('/mindmap')}
          className="flex items-center gap-4 w-full text-left group"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-950 shrink-0">
            <Brain className="w-6 h-6 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              마인드맵을 분석하여 모든 기능을 활성화하세요
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              게임 구조를 분석하면 장르 감지, 수익 전략 추천 등 고급 기능을 사용할 수 있습니다.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors shrink-0" />
        </button>
      </Card>
    );
  }

  const genreLabel = GAME_GENRE_LABELS.get(analysisResult.genre) ?? analysisResult.genre;

  const stats = [
    {
      icon: Target,
      label: '코어 루프',
      value: analysisResult.coreLoop,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: Coins,
      label: '재화 수',
      value: `${analysisResult.currencies.length}개`,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950',
    },
    {
      icon: Repeat,
      label: '리텐션 훅',
      value: `${analysisResult.retentionHooks.length}개`,
      color: 'text-green-500 bg-green-50 dark:bg-green-950',
    },
  ] as const;

  return (
    <Card
      title="게임 분석 상태"
      subtitle="마인드맵 분석 결과 요약"
      className="lg:col-span-2"
    >
      {/* Genre Badge */}
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-purple-500" />
        <span className="text-sm text-gray-600 dark:text-gray-400">감지된 장르</span>
        <Badge variant="primary" size="md">{genreLabel}</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((stat) => {
          const IconComp = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                <IconComp className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Dashboard Page
// ─────────────────────────────────────────────
export default function DashboardPage() {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const createProject = useProjectStore((s) => s.createProject);
  const [showModal, setShowModal] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  const handleCreate = useCallback(
    (name: string, genre: GameGenre, market: TargetMarket) => {
      createProject(name, genre, market);
      setShowModal(false);
    },
    [createProject],
  );

  return (
    <PageContainer
      title="대시보드"
      description="프로젝트 현황과 주요 지표를 한눈에 확인합니다."
      exportId="page-dashboard"
      exportName="대시보드"
    >
      {/* Header Action */}
      <div className="flex justify-end mb-6">
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowModal(true)}
        >
          새 프로젝트
        </Button>
      </div>

      {activeProject ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectSummaryCard project={activeProject} />
          <RevenueProjectionCard />
          {/* Game Analysis Status */}
          <GameAnalysisStatusCard />
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
        </div>
      ) : (
        <EmptyState
          icon={LayoutDashboard}
          title="프로젝트가 없습니다"
          description="새 프로젝트를 생성하여 유료화 설계를 시작하세요."
          action={
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowModal(true)}
            >
              새 프로젝트 생성
            </Button>
          }
        />
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
      />
    </PageContainer>
  );
}

interface NewProjectModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onCreate: (name: string, genre: GameGenre, market: TargetMarket) => void;
}

function NewProjectModal({ isOpen, onClose, onCreate }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState<GameGenre>('rpg');
  const [market, setMarket] = useState<TargetMarket>('kr');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    onCreate(trimmed, genre, market);
  };

  return (
    <Modal isOpen={isOpen} title="새 프로젝트 생성" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            프로젝트 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 신규 RPG 프로젝트"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Genre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            게임 장르
          </label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as GameGenre)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {[...GAME_GENRE_LABELS.entries()].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Market */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            타겟 시장
          </label>
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value as TargetMarket)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {[...TARGET_MARKET_LABELS.entries()].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={name.trim().length === 0}
          >
            생성
          </Button>
        </div>
      </div>
    </Modal>
  );
}
