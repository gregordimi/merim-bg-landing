/**
 * Pie Chart Component
 * Modern pie chart using shadcn/ui chart components
 */

import { useMemo } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from '@/config/ChartWrapper';
import { ChartConfig } from '@/components/ui/chart';
import { CHART_COLORS } from '@/config/chartConfig';

interface PieChartComponentProps {
  globalFilters: GlobalFilters;
}

function processPieData(resultSet: any, limit: number = 8) {
  if (!resultSet) return { chartData: [], chartConfig: {} };

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return { chartData: [], chartConfig: {} };
    
    const data = pivot
      .map((row: any, index: number) => ({
        name: (row['prices.category_group_name'] as string) || 'Unknown',
        value: Number(row['prices.averageRetailPrice']) || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .filter((item: any) => item.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, limit);

    const config: ChartConfig = {};
    data.forEach((item: any, index: number) => {
      const key = item.name.toLowerCase().replace(/\s+/g, '_');
      config[key] = {
        label: item.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return { chartData: data, chartConfig: config };
  } catch (error) {
    console.error("Error processing pie data:", error);
    return { chartData: [], chartConfig: {} };
  }
}

export function PieChartComponent({ globalFilters }: PieChartComponentProps) {
  const query = useMemo(() => buildOptimizedQuery(
    ['prices.averageRetailPrice'],
    globalFilters,
    ['prices.category_group_name']
  ), [globalFilters]);

  const { isLoading, error, resultSet, progress } = useStableQuery(
    () => query,
    [
      globalFilters.retailers?.join(",") ?? "",
      globalFilters.settlements?.join(",") ?? "",
      globalFilters.municipalities?.join(",") ?? "",
      globalFilters.categories?.join(",") ?? "",
      globalFilters.datePreset ?? "last7days",
    ],
    "pie-chart"
  );

  const { chartData, chartConfig } = useMemo(() => {
    return processPieData(resultSet, 8);
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Category Distribution"
      description={`Average retail prices by category (top ${chartData.length} categories)`}
      isLoading={isLoading}
      error={error}
      progress={progress}
      chartType="pie"
      data={chartData}
      chartConfigType="distribution"
      pieDataKey="value"
      innerRadius={60}
      outerRadius={120}
      showPercentage={true}
      height="large"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    >
      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">Total Categories</p>
          <p className="text-2xl font-bold">{chartData.length}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Avg Price</p>
          <p className="text-2xl font-bold">
            {chartData.length > 0 
              ? (chartData.reduce((sum: number, item: any) => sum + item.value, 0) / chartData.length).toFixed(2)
              : '0.00'
            } лв
          </p>
        </div>
      </div>
    </ChartWrapper>
  );
}
