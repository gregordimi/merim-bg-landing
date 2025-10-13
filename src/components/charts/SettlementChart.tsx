import { useMemo } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from '../../config/ChartWrapper';

interface SettlementChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  settlement: string;
  retailPrice: number;
  promoPrice: number;
}

function processSettlementData(resultSet: any, limit: number = 20) {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    return pivot
      .map((row: any) => ({
        settlement: row["prices.settlement_name"],
        retailPrice: Number(row["prices.averageRetailPrice"] || 0),
        promoPrice: Number(row["prices.averagePromoPrice"] || 0),
      }))
      .sort((a: ChartDataPoint, b: ChartDataPoint) => b.retailPrice - a.retailPrice)
      .slice(0, limit);
  } catch (error) {
    console.error("Error processing settlement data:", error);
    return [];
  }
}

export function SettlementChart({ globalFilters }: SettlementChartProps) {
  const query = useMemo(() => buildOptimizedQuery(
    ["prices.averageRetailPrice", "prices.averagePromoPrice"],
    globalFilters,
    ["prices.settlement_name"] // Always include settlements dimension
  ), [globalFilters]);

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      globalFilters.datePreset || "last7days",
    ],
    'settlement-chart'
  );

  const data = useMemo(() => {
    return processSettlementData(resultSet, 20);
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Top 20 Settlements - Retail vs Promo"
      description="Compare retail and promotional prices by settlement"
      isLoading={isLoading}
      error={error}
      progress={progress}
      chartType="bar"
      data={data}
      chartConfigType="trend"
      xAxisKey="settlement"
      dataKeys={['retailPrice', 'promoPrice']}
      height="large"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
