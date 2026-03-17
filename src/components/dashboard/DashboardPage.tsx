import { useState, useCallback } from 'react';
import { Plus, LayoutDashboard } from 'lucide-react';
import type { GameGenre, TargetMarket } from '../../models';
import { useProjectStore } from '../../stores/project-store';
import { GAME_GENRE_LABELS, TARGET_MARKET_LABELS } from '../../utils/constants';
import PageContainer from '../layout/PageContainer';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import ProjectSummaryCard from './ProjectSummaryCard';
import RevenueProjectionCard from './RevenueProjectionCard';
import QuickActions from './QuickActions';

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
