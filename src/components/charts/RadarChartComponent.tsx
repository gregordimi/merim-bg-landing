/**
 * Radar Chart Component
 * Modern radar chart using shadcn/ui chart components
 */

import { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
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

interface RadarChartComponentProps {
  globalFilters: GlobalFilters;
}

const chartConfig = {
  retailPrice: {
    label: "Retail Price",
    color: "hsl(var(--chart-1))",
  },
  promoPrice: {
    label: "Promo Price",
    color: "hsl(var(--chart-2))",
  },
  discountRate: {
    label: "Discount %",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function RadarChartComponent({ globalFilters }: RadarChartComponentProps) {
  const query = useMemo(() => buildOptimizedQuery({
    measures: [
      'prices.averageRetailPrice',
      'prices.averagePromoPrice',
      'prices.averageDiscountPercentage',
    ],
    dimensions: ['prices.retailer_name'],
    filters: globalFilters,
    limit: 6, // Top 6 retailers for readability
  }), [globalFilters]);

  const { isLoading, error, resultSet } = useStableQuery(query, 'radar-chart');

  const chartData = useMemo(() => {
    if (!resultSet) return [];
    
    const data = resultSet.tablePivot().map(row => ({
      retailer: (row['prices.retailer_name'] as string)?.slice(0, 20) || 'Unknown',
      retailPrice: Number(row['prices.averageRetailPrice']) || 0,
      promoPrice: Number(row['prices.averagePromoPrice']) || 0,
      discountRate: Number(row['prices.averageDiscountPercentage']) || 0,
    })).filter(item => item.retailPrice > 0);

    return data;
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
          <CardTitle>Retailer Performance Radar</CardTitle>
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
          <CardTitle>Retailer Performance Radar</CardTitle>
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
        <CardTitle>Retailer Performance Radar</CardTitle>
        <CardDescription>
          Multi-dimensional view of pricing metrics across retailers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[450px] w-full">
          <RadarChart data={chartData}>
            <PolarGrid gridType="circle" />
            <PolarAngleAxis 
              dataKey="retailer" 
              tick={{ fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 'dataMax']}
              tick={{ fontSize: 10 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Radar
              name="Retail Price"
              dataKey="retailPrice"
              stroke="var(--color-retailPrice)"
              fill="var(--color-retailPrice)"
              fillOpacity={0.6}
            />
            <Radar
              name="Promo Price"
              dataKey="promoPrice"
              stroke="var(--color-promoPrice)"
              fill="var(--color-promoPrice)"
              fillOpacity={0.6}
            />
            <Radar
              name="Discount %"
              dataKey="discountRate"
              stroke="var(--color-discountRate)"
              fill="var(--color-discountRate)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>

        {/* Summary Info */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Showing {chartData.length} retailers. Each axis represents a different metric. 
            Larger areas indicate higher values.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
