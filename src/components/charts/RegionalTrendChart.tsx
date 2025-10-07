import { useMemo } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensionsWithGranularity } from '@/utils/queryHelpers';
import { ChartWrapper } from './ChartWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RegionalTrendChartProps {
  globalFilters: GlobalFilters;
}

export function RegionalTrendChart({ globalFilters }: RegionalTrendChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      dimensions: ["municipality.name"],
      measures: ["prices.averageRetailPrice"],
      timeDimensions: buildTimeDimensionsWithGranularity(globalFilters.dateRange, 'day'),
      filters: buildFilters(globalFilters),
      order: { "prices.price_date": "asc" as const },
    }),
    [globalFilters.retailers, globalFilters.locations, globalFilters.categories, globalFilters.dateRange]
  );

  const chartData = useMemo(() => {
    if (!resultSet) return [];

    const pivot = resultSet.tablePivot();
    const dataMap = new Map();

    // Group data by date
    pivot.forEach((row: any) => {
      const date = row["prices.price_date.day"] || row["prices.price_date"];
      const municipality = row["municipality.name"];
      const price = Number(row["prices.averageRetailPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      
      const dateEntry = dataMap.get(date);
      dateEntry[municipality] = price > 0 ? price : null;
    });

    // Convert to array and sort by date
    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [resultSet]);

  // Get unique municipalities for line colors
  const municipalities = useMemo(() => {
    if (!resultSet) return [];
    const pivot = resultSet.tablePivot();
    const municipalitySet = new Set();
    pivot.forEach((row: any) => {
      if (row["municipality.name"]) {
        municipalitySet.add(row["municipality.name"]);
      }
    });
    return Array.from(municipalitySet);
  }, [resultSet]);

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
      title="Regional Price Trends"
      description="Track how prices vary across different municipalities over time"
      isLoading={isLoading}
      error={error}
      progress={progress}
    >
      {chartData.length > 0 && municipalities.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
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
            {municipalities.map((municipality, index) => (
              <Line
                key={String(municipality)}
                type="monotone"
                dataKey={String(municipality)}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
