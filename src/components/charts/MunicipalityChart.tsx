import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";

interface MunicipalityChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  municipality: string;
  retailPrice: number;
  promoPrice: number;
}

export function MunicipalityChart({ globalFilters }: MunicipalityChartProps) {
  const query = useMemo(() => buildOptimizedQuery(
    ["prices.averageRetailPrice", "prices.averagePromoPrice"],
    globalFilters,
    ["prices.municipality_name"] // Always include municipalities dimension
  ), [globalFilters]);

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      (globalFilters.retailers || []).join(","),
      (globalFilters.settlements || []).join(","),
      (globalFilters.municipalities || []).join(","),
      (globalFilters.categories || []).join(","),
      globalFilters.datePreset || "last7days",
    ],
    "municipality-chart"
  );

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    return pivot
      .map((row: any) => ({
        municipality: row["prices.municipality_name"],
        retailPrice: Number(row["prices.averageRetailPrice"] || 0),
        promoPrice: Number(row["prices.averagePromoPrice"] || 0),
      }))
      .sort((a, b) => b.retailPrice - a.retailPrice) // Sort by retail price descending
      .slice(0, 15); // Limit to top 15
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Top 15 Municipalities - Retail vs Promo"
      description="Compare retail and promotional prices across municipalities"
      isLoading={isLoading}
      error={error}
      progress={progress}
      chartType="bar"
      data={chartData}
      chartConfigType="trend"
      xAxisKey="municipality"
      dataKeys={['retailPrice', 'promoPrice']}
      height="large"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
