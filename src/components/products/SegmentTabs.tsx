import type { UserSegment } from '../../models';
import { USER_SEGMENT_LABELS } from '../../utils/constants';
import Tabs from '../ui/Tabs';

interface SegmentTabsProps {
  readonly activeSegment: UserSegment;
  readonly onSegmentChange: (segment: UserSegment) => void;
  readonly productCountBySegment: ReadonlyMap<UserSegment, number>;
}

const ALL_SEGMENTS: readonly UserSegment[] = [
  'offerwall',
  'non_payer',
  'minnow',
  'dolphin',
  'whale',
  'super_whale',
];

export default function SegmentTabs({
  activeSegment,
  onSegmentChange,
  productCountBySegment,
}: SegmentTabsProps) {
  const tabs = ALL_SEGMENTS.map((segment) => ({
    id: segment,
    label: USER_SEGMENT_LABELS.get(segment) ?? segment,
    count: productCountBySegment.get(segment) ?? 0,
  }));

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeSegment}
      onChange={(tabId) => onSegmentChange(tabId as UserSegment)}
    />
  );
}
