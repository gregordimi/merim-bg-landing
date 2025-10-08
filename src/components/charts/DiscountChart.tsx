import { useMemo, useState, useEffect } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DiscountChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  retailer: string;
  discount: number;
}

export function DiscountChart({ globalFilters }: DiscountChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => buildOptimizedQuery(
      ["prices.averageDiscountPercentage"],
      globalFilters,
      ["prices.retailer_name"] // Always include retailers dimension
    ),
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      (globalFilters.dateRange || []).join(',')
    ],
    'discount-chart'
  );

  // Keep track of the last valid data to prevent showing empty charts
  const [lastValidData, setLastValidData] = useState<ChartDataPoint[]>([]);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    return pivot
      .map((row: any) => ({
        retailer: row["prices.retailer_name"],
        discount: Number(row["prices.averageDiscountPercentage"] || 0),
      }))
      .sort((a, b) => b.discount - a.discount); // Sort by discount descending
  }, [resultSet]);

  // Update last valid data when we get new data
  useEffect(() => {
    if (chartData && chartData.length > 0 && !isLoading) {
      setLastValidData(chartData);
      setHasEverLoaded(true);
    }
  }, [chartData, isLoading]);

  // Determine what data to display
  const displayData = chartData || lastValidData;
  const shouldShowLoading = isLoading && !hasEverLoaded;

  return (
    <ChartWrapper
      title="Discount Rates by Retailer"
      description="See which retailers offer the best discounts"
      isLoading={shouldShowLoading}
      error={error}
      progress={progress}
    >
      {displayData && displayData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={displayData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="retailer"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
            <Tooltip
              formatter={(value: number) => [
                `${value.toFixed(1)}%`,
                "Discount Rate"
              ]}
              labelStyle={{ color: "#000" }}
            />
            <Bar dataKey="discount" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      ) : !shouldShowLoading ? (
        <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
          No data available for the selected filters
        </div>
      ) : null}
    </ChartWrapper>
  );
}