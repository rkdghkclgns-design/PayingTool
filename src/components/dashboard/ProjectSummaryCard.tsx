import type { ReactNode } from 'react';
import { Gamepad2, Globe, Package, GitBranch } from 'lucide-react';
import type { Project } from '../../models';
import { useProductStore } from '../../stores/product-store';
import { useFunnelStore } from '../../stores/funnel-store';
import { GAME_GENRE_LABELS, TARGET_MARKET_LABELS } from '../../utils/constants';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface ProjectSummaryCardProps {
  readonly project: Project;
}

export default function ProjectSummaryCard({ project }: ProjectSummaryCardProps) {
  const products = useProductStore((s) => s.products);
  const stages = useFunnelStore((s) => s.stages);

  const productCount = products.length;
  const assignedStages = stages.filter((s) => s.assignedProductIds.length > 0).length;
  const totalStages = stages.length;

  const genreLabel = GAME_GENRE_LABELS.get(project.gameGenre) ?? project.gameGenre;
  const marketLabel = TARGET_MARKET_LABELS.get(project.targetMarket) ?? project.targetMarket;

  return (
    <Card title="활성 프로젝트" subtitle={project.description || '프로젝트 설명이 없습니다'}>
      <div className="flex flex-col gap-4">
        {/* Project Name */}
        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {project.name}
        </h4>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary" size="md">
            <Gamepad2 className="w-3 h-3 mr-1 inline-block" />
            {genreLabel}
          </Badge>
          <Badge variant="success" size="md">
            <Globe className="w-3 h-3 mr-1 inline-block" />
            {marketLabel}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatItem
            icon={<Package className="w-4 h-4 text-brand-500" />}
            label="등록 상품"
            value={`${productCount}개`}
          />
          <StatItem
            icon={<GitBranch className="w-4 h-4 text-green-500" />}
            label="퍼널 상태"
            value={`${assignedStages}/${totalStages} 단계 설정됨`}
          />
        </div>
      </div>
    </Card>
  );
}

interface StatItemProps {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      {icon}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}
