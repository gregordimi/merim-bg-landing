/**
 * Styled Trend Chart Component
 * Uses shadcn/ui chart components for modern, professional appearance
 */

import { useMemo } from 'react';
import { useCubeQuery } from '@cubejs-client/react';
import { GlobalFilters } from '@/utils/cube/filterUtils';
import { buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { ChartWrapper } from '@/config/ChartWrapper';

interface StyledTrendChartProps {
  globalFilters: GlobalFilters;
}

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
    if (first === 0) return null;
    const change = ((last - first) / first) * 100;
    return {
      value: change.toFixed(1),
      direction: change > 0 ? ('up' as const) : ('down' as const),
    };
  }, [chartData]);

  return (
    <ChartWrapper
      title="Styled Price Trends"
      description="Modern gradient area charts with professional styling"
      isLoading={isLoading}
      error={error}
      trend={trend}
      chartType="area"
      data={chartData}
      chartConfigType="trend"
      xAxisKey="date"
      dataKeys={['retailPrice', 'promoPrice']}
      showGradients={true}
      yAxisFormatter={(value) => `${value.toFixed(1)} лв`}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
