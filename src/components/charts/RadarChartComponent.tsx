/**
 * Radar Chart Component
 * Modern radar chart using shadcn/ui chart components
 */

import { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from '@/config/ChartWrapper';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

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

function processRadarData(resultSet: any) {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];
    
    return pivot.map((row: any) => ({
      retailer: (row['prices.retailer_name'] as string)?.slice(0, 20) || 'Unknown',
      retailPrice: Number(row['prices.averageRetailPrice']) || 0,
      promoPrice: Number(row['prices.averagePromoPrice']) || 0,
      discountRate: Number(row['prices.averageDiscountPercentage']) || 0,
    })).filter((item: any) => item.retailPrice > 0);
  } catch (error) {
    console.error("Error processing radar data:", error);
    return [];
  }
}

export function RadarChartComponent({ globalFilters }: RadarChartComponentProps) {
  const query = useMemo(() => buildOptimizedQuery(
    [
      'prices.averageRetailPrice',
      'prices.averagePromoPrice',
      'prices.averageDiscountPercentage',
    ],
    globalFilters,
    ['prices.retailer_name']
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
    "radar-chart"
  );

  const chartData = useMemo(() => {
    return processRadarData(resultSet);
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Retailer Performance Radar"
      description="Multi-dimensional view of pricing metrics across retailers"
      isLoading={isLoading}
      error={error}
      progress={progress}
      chartType="custom"
      height="xl"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    >
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
    </ChartWrapper>
  );
}
