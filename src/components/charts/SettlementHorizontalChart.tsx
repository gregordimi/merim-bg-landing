import { useMemo, useState } from "react";
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";

interface SettlementHorizontalChartProps {
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

export function SettlementHorizontalChart({
  globalFilters,
}: SettlementHorizontalChartProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const query = useMemo(() => {
    const query = buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters,
      ["prices.settlement_name"] // Always include settlements dimension
    );
    
    // Remove time dimensions for aggregate query to improve performance
    query.timeDimensions = [];
    
    return query;
  }, [globalFilters, refreshKey]);

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      (globalFilters.retailers || []).join(","),
      (globalFilters.settlements || []).join(","),
      (globalFilters.municipalities || []).join(","),
      (globalFilters.categories || []).join(","),
      globalFilters.datePreset || "last7days",
      refreshKey,
    ],
    "settlement-horizontal-chart"
  );

  const handleReload = () => {
    setRefreshKey(prev => prev + 1);
  };

  const data = useMemo(() => {
    return processSettlementData(resultSet, 20);
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Top 20 Settlements - Horizontal View"
      description="Compare retail and promotional prices by settlement (horizontal bars)"
      isLoading={isLoading}
      error={error}
      progress={progress}
      chartType="horizontal-bar"
      data={data}
      chartConfigType="trend"
      xAxisKey="settlement"
      dataKeys={['retailPrice', 'promoPrice']}
      yAxisFormatter={(value) => `${value.toFixed(2)} лв`}
      yAxisWidth={130}
      height="xl"
      onReload={handleReload}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
