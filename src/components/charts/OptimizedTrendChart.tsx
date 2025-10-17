/**
 * Optimized Trend Chart - Uses pre-aggregation matching queries
 */

import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";
import { formatDate } from "@/utils/dateUtils";

interface OptimizedTrendChartProps {
  globalFilters: GlobalFilters;
}

function processOptimizedData(resultSet: any, granularity: string = "day") {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const dataMap = new Map();

    pivot.forEach((row: any) => {
      const dateKey = `prices.price_date.${granularity}`;
      const date = row[dateKey] || row["prices.price_date"];
      const retailPrice = Number(row["prices.averageRetailPrice"] || 0);
      const promoPrice = Number(row["prices.averagePromoPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date,
          retailPrice: 0,
          promoPrice: 0,
          count: 0,
        });
      }

      const existing = dataMap.get(date);
      existing.retailPrice += retailPrice;
      existing.promoPrice += promoPrice;
      existing.count += 1;
    });

    return Array.from(dataMap.values())
      .map((item) => ({
        date: item.date,
        retailPrice: item.count > 0 ? item.retailPrice / item.count : 0,
        promoPrice: item.count > 0 ? item.promoPrice / item.count : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Error processing optimized data:", error);
    return [];
  }
}

function calculateTrend(data: any[]) {
  if (data.length < 2) return undefined;

  const first = data[0].retailPrice;
  const last = data[data.length - 1].retailPrice;

  if (first === 0) return undefined;

  const change = ((last - first) / first) * 100;
  return {
    value: change.toFixed(1),
    direction: change > 0 ? ("up" as const) : ("down" as const),
  };
}


export function OptimizedTrendChart({
  globalFilters,
}: OptimizedTrendChartProps) {
  const query = useMemo(
    () =>
      buildOptimizedQuery(
        ["prices.averageRetailPrice", "prices.averagePromoPrice"],
        globalFilters
      ),
    [globalFilters]
  );

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      globalFilters.retailers?.join(",") ?? "",
      globalFilters.settlements?.join(",") ?? "",
      globalFilters.municipalities?.join(",") ?? "",
      globalFilters.categories?.join(",") ?? "",
      globalFilters.datePreset ?? "last7days",
      globalFilters.granularity ?? "day",
    ],
    "optimized-trend-chart"
  );

  const data = useMemo(() => {
    return processOptimizedData(resultSet, globalFilters.granularity);
  }, [resultSet, globalFilters.granularity]);

  const trend = useMemo(() => {
    return calculateTrend(data);
  }, [data]);

  return (
    <ChartWrapper
      title="📈 Price Trends (Optimized)"
      description="Retail and promotional price trends over time - uses pre-aggregations for fast performance"
      isLoading={isLoading}
      error={error}
      progress={progress}
      trend={trend}
      height="medium"
      chartType="area"
      data={data}
      chartConfigType="trend"
      xAxisKey="date"
      xAxisFormatter={formatDate}
      yAxisFormatter={(value) => `${value.toFixed(1)} лв`}
      dataKeys={["retailPrice", "promoPrice"]}
      showGradients={true}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
