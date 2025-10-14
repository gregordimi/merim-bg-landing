/**
 * Simple Trend Chart
 *
 * A simplified version that doesn't include filtered dimensions in the query,
 * which should provide cleaner trend lines when filters are applied.
 */

import { useMemo } from "react";
import {
  GlobalFilters,
  buildFilters,
  buildTimeDimensions,
} from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";
import { formatDate } from "@/utils/dateUtils";

interface SimpleTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  retailPrice: number;
  promoPrice: number;
}

function processSimpleData(resultSet: any, granularity: string = "day") {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const dateKey = `prices.price_date.${granularity}`;
    return pivot.map((row: any) => ({
      date: row[dateKey] || row["prices.price_date"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  } catch (error) {
    console.error("Error processing simple data:", error);
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
    direction: change > 0 ? "up" as const : "down" as const,
  };
}

export function SimpleTrendChart({ globalFilters }: SimpleTrendChartProps) {
  // Build a simple query without filtered dimensions
  const query = useMemo(
    () => ({
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: buildTimeDimensions(
        globalFilters.datePreset,
        globalFilters.granularity
      ),
      filters: buildFilters(globalFilters),
      order: { "prices.price_date": "asc" as const },
    }),
    [globalFilters]
  );

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      (globalFilters.retailers || []).join(","),
      (globalFilters.settlements || []).join(","),
      (globalFilters.municipalities || []).join(","),
      (globalFilters.categories || []).join(","),
      globalFilters.datePreset ?? "last7days",
      globalFilters.granularity ?? "day",
    ],
    "simple-trend-chart"
  );

  const data = useMemo(() => {
    return processSimpleData(resultSet, globalFilters.granularity);
  }, [resultSet, globalFilters.granularity]);

  const trend = useMemo(() => {
    return calculateTrend(data);
  }, [data]);

  return (
    <ChartWrapper
      title="Simple Price Trends Over Time"
      description="Clean trend lines without dimension grouping - shows overall averages for filtered data"
      isLoading={isLoading}
      error={error}
      progress={progress}
      trend={trend}
      chartType="area"
      data={data}
      chartConfigType="trend"
      xAxisKey="date"
      xAxisFormatter={formatDate}
      dataKeys={['retailPrice', 'promoPrice']}
      showGradients={true}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
