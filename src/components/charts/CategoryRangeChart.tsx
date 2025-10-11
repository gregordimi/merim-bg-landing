import { useMemo, useState, useEffect } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryRangeChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  category: string;
  average: number;
  minimum: number;
  maximum: number;
}

export function CategoryRangeChart({ globalFilters }: CategoryRangeChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => {
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
    },
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      globalFilters.datePreset || "last7days",
    ],
    'category-range-chart'
  );

  // Keep track of the last valid data to prevent showing empty charts
  const [lastValidData, setLastValidData] = useState<ChartDataPoint[]>([]);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    // Deduplicate by category name
    const categoryMap = new Map<string, ChartDataPoint>();
    
    pivot.forEach((row: any) => {
      const category = row["prices.category_group_name"];
      if (!category) return;
      
      const average = Number(row["prices.averageRetailPrice"] || 0);
      const minimum = Number(row["prices.minRetailPrice"] || 0);
      const maximum = Number(row["prices.maxRetailPrice"] || 0);
      
      // If category already exists, take the max values (or could aggregate differently)
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
      .filter(item => item.average > 0 || item.minimum > 0 || item.maximum > 0) // Filter out zero entries
      .sort((a, b) => b.average - a.average) // Sort by average price descending
      .slice(0, 50); // Limit to top 50 categories to avoid overcrowding
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
      title="Price Range by Category"
      description="Min, average, and max prices for each category"
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
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string) => {
                let label = "Price";
                if (name === "minimum") label = "Min Price";
                else if (name === "average") label = "Avg Price";
                else if (name === "maximum") label = "Max Price";
                return [`${value.toFixed(2)} лв`, label];
              }}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Bar dataKey="minimum" fill="#82ca9d" name="Min Price" />
            <Bar dataKey="average" fill="#0088FE" name="Avg Price" />
            <Bar dataKey="maximum" fill="#FF8042" name="Max Price" />
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