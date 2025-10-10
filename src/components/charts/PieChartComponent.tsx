/**
 * Pie Chart Component
 * Modern pie chart using shadcn/ui chart components
 */

import { useMemo } from 'react';
import { Pie, PieChart, Cell, Legend } from 'recharts';
import { GlobalFilters } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildOptimizedQuery } from '@/utils/cube/filterUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface PieChartComponentProps {
  globalFilters: GlobalFilters;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function PieChartComponent({ globalFilters }: PieChartComponentProps) {
  const query = useMemo(() => buildOptimizedQuery({
    measures: ['prices.averageRetailPrice'],
    dimensions: ['prices.category_group_name'],
    filters: globalFilters,
    limit: 8, // Top 8 categories
  }), [globalFilters]);

  const { isLoading, error, resultSet } = useStableQuery(query, 'pie-chart');

  const { chartData, chartConfig } = useMemo(() => {
    if (!resultSet) return { chartData: [], chartConfig: {} };
    
    const data = resultSet.tablePivot()
      .map((row, index) => ({
        name: (row['prices.category_group_name'] as string) || 'Unknown',
        value: Number(row['prices.averageRetailPrice']) || 0,
        fill: COLORS[index % COLORS.length],
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const config: ChartConfig = {};
    data.forEach((item, index) => {
      const key = item.name.toLowerCase().replace(/\s+/g, '_');
      config[key] = {
        label: item.name,
        color: COLORS[index % COLORS.length],
      };
    });

    return { chartData: data, chartConfig: config };
  }, [resultSet]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>Unable to load chart data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-sm">{error.message || 'Failed to load data'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>No data available for the selected filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <p className="text-sm">No data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>
          Average retail prices by category (top {chartData.length} categories)
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              {(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
