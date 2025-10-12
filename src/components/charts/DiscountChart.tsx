import { useMemo, useState, useEffect } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from '../../config/ChartWrapper';
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
    () => {
      // For DiscountChart, we need to ensure retailer dimension is always included
      // even when retailers are filtered, to show breakdown by retailer
      const query = buildOptimizedQuery(
        ["prices.averageDiscountPercentage"],
        globalFilters,
        [] // Don't pass additional dimensions here
      );
      
      // Force include retailer dimension for this chart
      if (!query.dimensions) {
        query.dimensions = [];
      }
      if (!query.dimensions.includes("prices.retailer_name")) {
        query.dimensions.push("prices.retailer_name");
      }
      
      return query;
    },
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      globalFilters.datePreset || "last7days",
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

    // Group by retailer to handle any potential duplicates
    const retailerMap = new Map<string, { discount: number; count: number }>();
    
    pivot.forEach((row: any) => {
      const retailer = row["prices.retailer_name"];
      const discount = Number(row["prices.averageDiscountPercentage"] || 0);
      
      if (!retailer) return; // Skip rows without retailer
      
      if (retailerMap.has(retailer)) {
        // If duplicate, average the values
        const existing = retailerMap.get(retailer)!;
        existing.discount = (existing.discount * existing.count + discount) / (existing.count + 1);
        existing.count += 1;
      } else {
        retailerMap.set(retailer, { discount, count: 1 });
      }
    });

    return Array.from(retailerMap.entries())
      .map(([retailer, data]) => ({
        retailer,
        discount: data.discount,
      }))
      .sort((a, b) => b.discount - a.discount); // Sort by discount descending
  }, [resultSet]);

  // Update last valid data when we get new data
  useEffect(() => {
    if (chartData && chartData.length > 0 && !isLoading) {
      console.log('DiscountChart: Updated chart data', {
        dataLength: chartData.length,
        retailers: chartData.map(d => d.retailer),
        sampleData: chartData.slice(0, 3)
      });
      setLastValidData(chartData);
      setHasEverLoaded(true);
    }
    // If loading finished but no data, and we've never loaded, mark as loaded
    if (!isLoading && !chartData && !hasEverLoaded) {
      setHasEverLoaded(true);
    }
  }, [chartData, isLoading, hasEverLoaded]);

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