import { useMemo, useState, useEffect } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensions } from '@/utils/queryHelpers';
import { ChartWrapper } from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SettlementChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  settlement: string;
  retailPrice: number;
  promoPrice: number;
}

export function SettlementChart({ globalFilters }: SettlementChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      dimensions: ["settlements.name_bg"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: buildTimeDimensions(globalFilters.dateRange),
      filters: buildFilters(globalFilters),
      // ✅ Removed order and limit to hit cache
    }),
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.locations || []).join(','),
      (globalFilters.categories || []).join(','),
      (globalFilters.dateRange || []).join(',')
    ],
    'settlement-chart'
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
        settlement: row["settlements.name_bg"],
        retailPrice: Number(row["prices.averageRetailPrice"] || 0),
        promoPrice: Number(row["prices.averagePromoPrice"] || 0),
      }))
      .sort((a, b) => b.retailPrice - a.retailPrice) // ✅ Sort by retail price descending
      .slice(0, 20); // ✅ Limit to top 20
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
      title="Top 20 Settlements - Retail vs Promo"
      description="Compare retail and promotional prices by settlement"
      isLoading={shouldShowLoading}
      error={error}
      progress={progress}
    >
      {displayData && displayData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={displayData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="settlement"
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
      ) : !shouldShowLoading ? (
        <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
          No data available for the selected filters
        </div>
      ) : null}
    </ChartWrapper>
  );
}
