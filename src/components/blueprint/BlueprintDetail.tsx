import type { GenreBlueprint } from '../../models/genre-blueprint';
import BlueprintProductMix from './BlueprintProductMix';
import BlueprintPriceTiers from './BlueprintPriceTiers';
import BlueprintKpis from './BlueprintKpis';
import BlueprintStrategies from './BlueprintStrategies';
import BlueprintRegionalLtv from './BlueprintRegionalLtv';
import BlueprintMistakesAndExamples from './BlueprintMistakesAndExamples';

interface BlueprintDetailProps {
  readonly blueprint: GenreBlueprint;
}

export default function BlueprintDetail({ blueprint }: BlueprintDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {blueprint.genreLabelKo} 설계도
        </h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          최종 업데이트: {blueprint.updatedAt}
        </span>
      </div>

      {/* Section 1: Product Mix */}
      <BlueprintProductMix productMix={blueprint.productMix} />

      {/* Section 2: Price Tiers */}
      <BlueprintPriceTiers priceTiers={blueprint.priceTiers} />

      {/* Section 3: Benchmark KPIs */}
      <BlueprintKpis kpis={blueprint.benchmarkKpis} />

      {/* Section 4 & 5: Key Strategies + Funnel Tips */}
      <BlueprintStrategies
        keyStrategies={blueprint.keyStrategies}
        funnelTips={blueprint.funnelTips}
      />

      {/* Section 6: Regional LTV */}
      <BlueprintRegionalLtv regionalLtv={blueprint.regionalLtv} />

      {/* Section 7 & 8: Common Mistakes + Success Examples */}
      <BlueprintMistakesAndExamples
        commonMistakes={blueprint.commonMistakes}
        successfulExamples={blueprint.successfulExamples}
      />
    </div>
  );
}
