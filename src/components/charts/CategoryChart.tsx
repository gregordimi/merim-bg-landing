import { useMemo } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensions } from '@/utils/queryHelpers';
import { ChartWrapper } from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryChartProps {
  globalFilters: GlobalFilters;
}

export function CategoryChart({ globalFilters }: CategoryChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      dimensions: ["category_groups.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: buildTimeDimensions(globalFilters.dateRange),
      filters: buildFilters(globalFilters),
      order: { "prices.averageRetailPrice": "desc" as const },
      limit: 20,
    }),
    [globalFilters.retailers, globalFilters.locations, globalFilters.categories, globalFilters.dateRange]
  );

  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      category: row["category_groups.name"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Average Retail & Promo Prices by Category"
      description="Compare retail and promotional prices across product categories"
      isLoading={isLoading}
      error={error}
      progress={progress}
    >
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
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
      )}
    </ChartWrapper>
  );
}
