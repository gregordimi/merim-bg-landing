import { useMemo, useState, useEffect } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from './ChartWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  [category: string]: any;
}

export function CategoryTrendChart({ globalFilters }: CategoryTrendChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => buildOptimizedQuery(
      ["prices.averageRetailPrice"],
      globalFilters,
      ["prices.category_group_name"] // Always include categories dimension
    ),
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      globalFilters.datePreset ?? "last7days",
      globalFilters.granularity ?? "day",
    ],
    'category-trend-chart'
  );

  // Keep track of the last valid data to prevent showing empty charts
  const [lastValidData, setLastValidData] = useState<ChartDataPoint[]>([]);
  const [lastValidCategories, setLastValidCategories] = useState<string[]>([]);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    const dataMap = new Map();

    // Group data by date
    pivot.forEach((row: any) => {
      const granularity = globalFilters.granularity ?? "day";
      const dateKey = `prices.price_date.${granularity}`;
      const date = row[dateKey] || row["prices.price_date"];
      const category = row["prices.category_group_name"];
      const price = Number(row["prices.averageRetailPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      
      const dateEntry = dataMap.get(date);
      dateEntry[category] = price > 0 ? price : null;
    });

    // Convert to array and sort by date
    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [resultSet, globalFilters.granularity]);

  // Get unique categories for line colors
  const categories = useMemo(() => {
    if (!resultSet) return null;
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    const categorySet = new Set();
    pivot.forEach((row: any) => {
      if (row["prices.category_group_name"]) {
        categorySet.add(row["prices.category_group_name"]);
      }
    });
    return Array.from(categorySet) as string[];
  }, [resultSet]);

  // Update last valid data when we get new data
  useEffect(() => {
    if (chartData && chartData.length > 0 && categories && categories.length > 0 && !isLoading) {
      setLastValidData(chartData);
      setLastValidCategories(categories);
      setHasEverLoaded(true);
    }
  }, [chartData, categories, isLoading]);

  // Determine what data to display
  const displayData = chartData || lastValidData;
  const displayCategories = categories || lastValidCategories;
  const shouldShowLoading = isLoading && !hasEverLoaded;

  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", 
    "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"
  ];

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <ChartWrapper
      title="Category Price Trends"
      description="Track how prices change across different product categories over time"
      isLoading={shouldShowLoading}
      error={error}
      progress={progress}
    >
      {displayData && displayData.length > 0 && displayCategories && displayCategories.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={displayData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${Number(value).toFixed(2)} лв`,
                name
              ]}
              labelFormatter={(date) => formatDate(date)}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            {displayCategories.map((category, index) => (
              <Line
                key={String(category)}
                type="monotone"
                dataKey={String(category)}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : !shouldShowLoading ? (
        <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
          No data available for the selected filters
        </div>
      ) : null}
    </ChartWrapper>
  );
}