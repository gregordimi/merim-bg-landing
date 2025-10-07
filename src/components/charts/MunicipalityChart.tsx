import { useMemo } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensions } from '@/utils/queryHelpers';
import { ChartWrapper } from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MunicipalityChartProps {
  globalFilters: GlobalFilters;
}

export function MunicipalityChart({ globalFilters }: MunicipalityChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      dimensions: ["municipality.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: buildTimeDimensions(globalFilters.dateRange),
      filters: buildFilters(globalFilters),
      order: { "prices.averageRetailPrice": "desc" as const },
      limit: 15,
    }),
    [globalFilters.retailers, globalFilters.locations, globalFilters.categories, globalFilters.dateRange]
  );

  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      municipality: row["municipality.name"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Top 15 Municipalities - Retail vs Promo"
      description="Compare retail and promotional prices across municipalities"
      isLoading={isLoading}
      error={error}
      progress={progress}
    >
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="municipality"
              angle={-45}
              textAnchor="end"
              height={120}
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
