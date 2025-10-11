/**
 * Styled Trend Chart Component
 * Uses shadcn/ui chart components for modern, professional appearance
 */

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useCubeQuery } from '@cubejs-client/react';
import { GlobalFilters } from '@/utils/cube/filterUtils';
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
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface StyledTrendChartProps {
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
} satisfies ChartConfig;

export function StyledTrendChart({ globalFilters }: StyledTrendChartProps) {
  const query = useMemo(() => buildOptimizedQuery(
    [
      'prices.averageRetailPrice',
      'prices.averagePromoPrice',
    ],
    globalFilters
  ), [globalFilters]);

  const { isLoading, error, resultSet } = useCubeQuery(query, {
    castNumerics: true,
  });

  const chartData = useMemo(() => {
    if (!resultSet) return [];
    const granularity = globalFilters.granularity ?? "day";
    const dateKey = `prices.price_date.${granularity}`;
    return resultSet.tablePivot().map(row => ({
      date: new Date(row[dateKey] as string).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      retailPrice: Number(row['prices.averageRetailPrice']) || 0,
      promoPrice: Number(row['prices.averagePromoPrice']) || 0,
    }));
  }, [resultSet, globalFilters.granularity]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].retailPrice;
    const last = chartData[chartData.length - 1].retailPrice;
    const change = ((last - first) / first) * 100;
    return {
      value: change.toFixed(1),
      direction: change > 0 ? 'up' : 'down',
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Trends Over Time</CardTitle>
          <CardDescription>Unable to load chart data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-sm">{error.message || 'Failed to load data'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Trends Over Time</CardTitle>
        <CardDescription>
          Tracking retail and promotional price changes
          {trend && (
            <span className={`ml-2 inline-flex items-center text-sm font-medium ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${
                trend.direction === 'down' ? 'rotate-180' : ''
              }`} />
              {trend.value}%
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillRetail" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-retailPrice)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-retailPrice)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPromo" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-promoPrice)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-promoPrice)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(1)}`}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              type="monotone"
              dataKey="retailPrice"
              stroke="var(--color-retailPrice)"
              fill="url(#fillRetail)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="promoPrice"
              stroke="var(--color-promoPrice)"
              fill="url(#fillPromo)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
