import { useMemo } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from '../../config/ChartWrapper';

interface CategoryRangeChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  category: string;
  minimum: number;
  average: number;
  maximum: number;
}

function processCategoryRangeData(resultSet: any, limit: number = 50) {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const categoryMap = new Map<string, ChartDataPoint>();
    
    pivot.forEach((row: any) => {
      const category = row["prices.category_group_name"];
      if (!category) return;
      
      const average = Number(row["prices.averageRetailPrice"] || 0);
      const minimum = Number(row["prices.minRetailPrice"] || 0);
      const maximum = Number(row["prices.maxRetailPrice"] || 0);
      
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        categoryMap.set(category, {
          category,
          average: Math.max(existing.average, average),
          minimum: Math.min(existing.minimum, minimum),
          maximum: Math.max(existing.maximum, maximum),
        });
      } else {
        categoryMap.set(category, {
          category,
          average,
          minimum,
          maximum,
        });
      }
    });

    return Array.from(categoryMap.values())
      .filter(item => item.average > 0 || item.minimum > 0 || item.maximum > 0)
      .sort((a: ChartDataPoint, b: ChartDataPoint) => b.average - a.average)
      .slice(0, limit);
  } catch (error) {
    console.error("Error processing category range data:", error);
    return [];
  }
}

export function CategoryRangeChart({ globalFilters }: CategoryRangeChartProps) {
  const query = useMemo(() => {
    // Build a query without time dimensions for aggregated stats
    const query = buildOptimizedQuery(
      [
        "prices.averageRetailPrice",
        "prices.minRetailPrice",
        "prices.maxRetailPrice",
      ],
      globalFilters,
      ["prices.category_group_name"] // Always include categories dimension
    );
    
    // Remove time dimensions for aggregate query to avoid duplicates
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
    'category-range-chart'
  );

  const data = useMemo(() => {
    return processCategoryRangeData(resultSet, 50);
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Price Range by Category"
      description="Min, average, and max prices for each category"
      isLoading={isLoading}
      error={error}
      progress={progress}
      chartType="bar"
      data={data}
      chartConfigType="category"
      xAxisKey="category"
      dataKeys={['minimum', 'average', 'maximum']}
      height="large"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}