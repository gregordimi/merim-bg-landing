import { useMemo, useState, useEffect } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  category: string;
  retailPrice: number;
  promoPrice: number;
}

export function CategoryChart({ globalFilters }: CategoryChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => {
      // For CategoryChart, we need to ensure category dimension is always included
      // even when categories are filtered, to show breakdown by category
      const query = buildOptimizedQuery(
        ["prices.averageRetailPrice", "prices.averagePromoPrice"],
        globalFilters,
        [] // Don't pass additional dimensions here
      );
      
      // Force include category dimension for this chart
      if (!query.dimensions) {
        query.dimensions = [];
      }
      if (!query.dimensions.includes("prices.category_group_name")) {
        query.dimensions.push("prices.category_group_name");
      }
      
      return query;
    },
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      (globalFilters.dateRange || []).join(',')
    ],
    'category-chart'
  );

  // Keep track of the last valid data to prevent showing empty charts
  const [lastValidData, setLastValidData] = useState<ChartDataPoint[]>([]);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    // Group by category to handle any potential duplicates
    const categoryMap = new Map<string, { retailPrice: number; promoPrice: number; count: number }>();
    
    pivot.forEach((row: any) => {
      const category = row["prices.category_group_name"];
      const retailPrice = Number(row["prices.averageRetailPrice"] || 0);
      const promoPrice = Number(row["prices.averagePromoPrice"] || 0);
      
      if (!category) return; // Skip rows without category
      
      if (categoryMap.has(category)) {
        // If duplicate, average the values
        const existing = categoryMap.get(category)!;
        existing.retailPrice = (existing.retailPrice * existing.count + retailPrice) / (existing.count + 1);
        existing.promoPrice = (existing.promoPrice * existing.count + promoPrice) / (existing.count + 1);
        existing.count += 1;
      } else {
        categoryMap.set(category, { retailPrice, promoPrice, count: 1 });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        retailPrice: data.retailPrice,
        promoPrice: data.promoPrice,
      }))
      .sort((a, b) => b.retailPrice - a.retailPrice) // Sort by retail price descending
      .slice(0, 20); // Limit to top 20
  }, [resultSet]);

  // Update last valid data when we get new data
  useEffect(() => {
    if (chartData && chartData.length > 0 && !isLoading) {
      console.log('CategoryChart: Updated chart data', {
        dataLength: chartData.length,
        categories: chartData.map(d => d.category),
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
      title="Average Retail & Promo Prices by Category"
      description="Compare retail and promotional prices across product categories"
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
                const label = name === "retailPrice" ? "Retail Price" : "Promo Price";
                return [`${value.toFixed(2)} лв`, label];
              }}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Bar dataKey="retailPrice" fill="#0088FE" name="Retail Price" />
            <Bar dataKey="promoPrice" fill="#00C49F" name="Promo Price" />
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
