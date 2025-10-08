import { useMemo, useState, useEffect } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from './ChartWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RetailerTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  [retailer: string]: any;
}

export function RetailerTrendChart({ globalFilters }: RetailerTrendChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => buildOptimizedQuery(
      ["prices.averageRetailPrice"],
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
    'retailer-trend-chart'
  );

  // Keep track of the last valid data to prevent showing empty charts
  const [lastValidData, setLastValidData] = useState<ChartDataPoint[]>([]);
  const [lastValidRetailers, setLastValidRetailers] = useState<string[]>([]);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    const dataMap = new Map();

    // Group data by date
    pivot.forEach((row: any) => {
      const date = row["prices.price_date.day"] || row["prices.price_date"];
      const retailer = row["prices.retailer_name"];
      const price = Number(row["prices.averageRetailPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      
      const dateEntry = dataMap.get(date);
      dateEntry[retailer] = price > 0 ? price : null;
    });

    // Convert to array and sort by date
    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [resultSet]);

  // Get unique retailers for line colors
  const retailers = useMemo(() => {
    if (!resultSet) return null;
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    const retailerSet = new Set();
    pivot.forEach((row: any) => {
      if (row["prices.retailer_name"]) {
        retailerSet.add(row["prices.retailer_name"]);
      }
    });
    return Array.from(retailerSet) as string[];
  }, [resultSet]);

  // Update last valid data when we get new data
  useEffect(() => {
    if (chartData && chartData.length > 0 && retailers && retailers.length > 0 && !isLoading) {
      setLastValidData(chartData);
      setLastValidRetailers(retailers);
      setHasEverLoaded(true);
    }
  }, [chartData, retailers, isLoading]);

  // Determine what data to display
  const displayData = chartData || lastValidData;
  const displayRetailers = retailers || lastValidRetailers;
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
      title="Retailer Price Trends"
      description="Compare how different retailers' prices change over time"
      isLoading={shouldShowLoading}
      error={error}
      progress={progress}
    >
      {displayData && displayData.length > 0 && displayRetailers && displayRetailers.length > 0 ? (
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
            {displayRetailers.map((retailer, index) => (
              <Line
                key={String(retailer)}
                type="monotone"
                dataKey={String(retailer)}
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