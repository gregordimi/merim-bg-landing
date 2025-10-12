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

interface SimpleTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  retailPrice: number;
  promoPrice: number;
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

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    return pivot.map((row: any) => {
      const granularity = globalFilters.granularity ?? "day";
      const dateKey = `prices.price_date.${granularity}`;
      return {
        date: row[dateKey] || row["prices.price_date"],
        retailPrice: Number(row["prices.averageRetailPrice"] || 0),
        promoPrice: Number(row["prices.averagePromoPrice"] || 0),
      };
    });
  }, [resultSet, globalFilters]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Calculate trend for display
  const trend = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;
    const first = chartData[0].retailPrice;
    const last = chartData[chartData.length - 1].retailPrice;
    if (first === 0) return null;
    const change = ((last - first) / first) * 100;
    return {
      value: change.toFixed(1),
      direction: change > 0 ? ("up" as const) : ("down" as const),
    };
  }, [chartData]);

  return (
    <ChartWrapper
      title="Simple Price Trends Over Time"
      description="Clean trend lines without dimension grouping - shows overall averages for filtered data"
      isLoading={isLoading}
      error={error}
      progress={progress}
      trend={trend}
      chartType="area"
      data={chartData}
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
