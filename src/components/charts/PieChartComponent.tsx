/**
 * Pie Chart Component
 * Modern pie chart using shadcn/ui chart components
 */

import { useMemo } from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import { useCubeQuery } from '@cubejs-client/react';
import { GlobalFilters } from '@/utils/cube/filterUtils';
import { buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { ChartWrapper } from '@/config/ChartWrapper';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { CHART_COLORS } from '@/config/chartConfig';

interface PieChartComponentProps {
  globalFilters: GlobalFilters;
}

export function PieChartComponent({ globalFilters }: PieChartComponentProps) {
  const query = useMemo(() => buildOptimizedQuery(
    ['prices.averageRetailPrice'],
    globalFilters,
    ['prices.category_group_name']
  ), [globalFilters]);

  const { isLoading, error, resultSet } = useCubeQuery(query, {
    castNumerics: true,
  });

  const { chartData, chartConfig } = useMemo(() => {
    if (!resultSet) return { chartData: [], chartConfig: {} };
    
    const data = resultSet.tablePivot()
      .map((row, index) => ({
        name: (row['prices.category_group_name'] as string) || 'Unknown',
        value: Number(row['prices.averageRetailPrice']) || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Limit to top 8 categories for better readability

    const config: ChartConfig = {};
    data.forEach((item, index) => {
      const key = item.name.toLowerCase().replace(/\s+/g, '_');
      config[key] = {
        label: item.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return { chartData: data, chartConfig: config };
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Category Distribution"
      description={`Average retail prices by category (top ${chartData.length} categories)`}
      isLoading={isLoading}
      error={error}
      chartType="custom"
      height="large"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    >
      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => 
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={120}
            innerRadius={60}
            dataKey="value"
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend
            content={<ChartLegendContent />}
            className="flex-wrap gap-2"
          />
        </PieChart>
      </ChartContainer>
      
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
              ? (chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toFixed(2)
              : '0.00'
            } лв
          </p>
        </div>
      </div>
    </ChartWrapper>
  );
}
