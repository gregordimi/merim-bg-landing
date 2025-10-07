import { useMemo } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensionsWithGranularity } from '@/utils/queryHelpers';
import { ChartWrapper } from './ChartWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  globalFilters: GlobalFilters;
}

export function TrendChart({ globalFilters }: TrendChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: buildTimeDimensionsWithGranularity(globalFilters.dateRange, 'day'),
      filters: buildFilters(globalFilters),
      order: { "prices.price_date": "asc" as const },
    }),
    [globalFilters.retailers, globalFilters.locations, globalFilters.categories, globalFilters.dateRange]
  );

  const chartData = useMemo(() => {
    if (!resultSet) return [];
    
    return resultSet.tablePivot().map((row: any) => ({
      date: row["prices.price_date.day"] || row["prices.price_date"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

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
      title="Price Trends Over Time"
      description="Track retail and promotional price changes"
      isLoading={isLoading}
      error={error}
      progress={progress}
    >
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${Number(value).toFixed(2)} лв`,
                name === "retailPrice" ? "Retail Price" : "Promo Price"
              ]}
              labelFormatter={(date) => formatDate(date)}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="retailPrice"
              stroke="#0088FE"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Retail Price"
            />
            <Line
              type="monotone"
              dataKey="promoPrice"
              stroke="#00C49F"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Promo Price"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
