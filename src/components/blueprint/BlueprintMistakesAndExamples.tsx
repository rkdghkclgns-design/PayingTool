import { AlertTriangle, Star } from 'lucide-react';
import type { SuccessfulExample } from '../../models/genre-blueprint';
import Card from '../ui/Card';

interface BlueprintMistakesAndExamplesProps {
  readonly commonMistakes: readonly string[];
  readonly successfulExamples: readonly SuccessfulExample[];
}

export default function BlueprintMistakesAndExamples({
  commonMistakes,
  successfulExamples,
}: BlueprintMistakesAndExamplesProps) {
  return (
    <div className="space-y-6">
      {/* Common Mistakes */}
      <Card
        title="흔한 실수"
        headerAction={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {commonMistakes.map((mistake, idx) => (
            <div
              key={idx}
              className="flex gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {mistake}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Successful Examples */}
      <Card
        title="성공 사례"
        headerAction={<Star className="w-5 h-5 text-brand-500" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {successfulExamples.map((example) => (
            <div
              key={example.name}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="mb-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {example.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {example.developer}
                </p>
              </div>
              <div className="mb-3">
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  {example.annualRevenue}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                {example.monetizationApproach}
              </p>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                  {example.keyTakeaway}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
