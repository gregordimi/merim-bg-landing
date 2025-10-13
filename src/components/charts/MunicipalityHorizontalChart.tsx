import { useMemo } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from '../../config/ChartWrapper';

interface MunicipalityHorizontalChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  municipality: string;
  retailPrice: number;
  promoPrice: number;
}

function processMunicipalityData(resultSet: any, limit: number = 15) {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    return pivot
      .map((row: any) => ({
        municipality: row["prices.municipality_name"],
        retailPrice: Number(row["prices.averageRetailPrice"] || 0),
        promoPrice: Number(row["prices.averagePromoPrice"] || 0),
      }))
      .sort((a: ChartDataPoint, b: ChartDataPoint) => b.retailPrice - a.retailPrice)
      .slice(0, limit);
  } catch (error) {
    console.error("Error processing municipality data:", error);
    return [];
  }
}

export function MunicipalityHorizontalChart({ globalFilters }: MunicipalityHorizontalChartProps) {
  const query = useMemo(() => {
    const query = buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters,
      ["prices.municipality_name"] // Always include municipalities dimension
    );
    
    // Remove time dimensions for aggregate query to improve performance
    query.timeDimensions = [];
    
    return query;
  }, [globalFilters]);

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      globalFilters.datePreset || "last7days",
    ],
    'municipality-horizontal-chart'
  );

  const data = useMemo(() => {
    return processMunicipalityData(resultSet, 15);
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Top 15 Municipalities - Horizontal View"
      description="Compare retail and promotional prices across municipalities (horizontal bars)"
      isLoading={isLoading}
      error={error}
      progress={progress}
      chartType="horizontal-bar"
      data={data}
      chartConfigType="trend"
      xAxisKey="municipality"
      dataKeys={['retailPrice', 'promoPrice']}
      yAxisFormatter={(value) => `${value.toFixed(2)} лв`}
      yAxisWidth={130}
      height="xl"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}