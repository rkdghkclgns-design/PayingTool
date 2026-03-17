import { Lightbulb, Target } from 'lucide-react';
import Card from '../ui/Card';

interface BlueprintStrategiesProps {
  readonly keyStrategies: readonly string[];
  readonly funnelTips: readonly string[];
}

interface NumberedListProps {
  readonly items: readonly string[];
}

function NumberedList({ items }: NumberedListProps) {
  return (
    <ol className="space-y-3">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 flex items-center justify-center text-xs font-bold">
            {idx + 1}
          </span>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {item}
          </p>
        </li>
      ))}
    </ol>
  );
}

export default function BlueprintStrategies({ keyStrategies, funnelTips }: BlueprintStrategiesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card
        title="핵심 전략"
        headerAction={<Lightbulb className="w-5 h-5 text-yellow-500" />}
      >
        <NumberedList items={keyStrategies} />
      </Card>

      <Card
        title="퍼널 최적화 팁"
        headerAction={<Target className="w-5 h-5 text-brand-500" />}
      >
        <NumberedList items={funnelTips} />
      </Card>
    </div>
  );
}
