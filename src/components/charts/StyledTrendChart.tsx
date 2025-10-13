/**
 * Styled Trend Chart Component
 * Uses shadcn/ui chart components for modern, professional appearance
 */

import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "@/config/ChartWrapper";

interface StyledTrendChartProps {
  globalFilters: GlobalFilters;
}

function processStyledTrendData(resultSet: any, granularity: string = "day") {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const dateKey = `prices.price_date.${granularity}`;
    return pivot.map((row: any) => ({
      date: new Date(row[dateKey] as string).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      retailPrice: Number(row["prices.averageRetailPrice"]) || 0,
      promoPrice: Number(row["prices.averagePromoPrice"]) || 0,
    }));
  } catch (error) {
    console.error("Error processing styled trend data:", error);
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

export function StyledTrendChart({ globalFilters }: StyledTrendChartProps) {
  const query = useMemo(
    () =>
      buildOptimizedQuery(
        ["prices.averageRetailPrice", "prices.averagePromoPrice"],
        globalFilters
      ),
    [globalFilters]
  );

  const { isLoading, error, resultSet, progress } = useStableQuery(
    () => query,
    [
      globalFilters.retailers?.join(",") ?? "",
      globalFilters.settlements?.join(",") ?? "",
      globalFilters.municipalities?.join(",") ?? "",
      globalFilters.categories?.join(",") ?? "",
      globalFilters.datePreset ?? "last7days",
      globalFilters.granularity ?? "day",
    ],
    "styled-trend-chart"
  );

  const data = useMemo(() => {
    return processStyledTrendData(resultSet, globalFilters.granularity);
  }, [resultSet, globalFilters.granularity]);

  const trend = useMemo(() => {
    return calculateTrend(data);
  }, [data]);

  return (
    <ChartWrapper
      title="Styled Price Trends"
      description="Modern gradient area charts with professional styling"
      isLoading={isLoading}
      error={error}
      trend={trend}
      chartType="area"
      data={data}
      progress={progress}
      chartConfigType="trend"
      xAxisKey="date"
      dataKeys={["retailPrice", "promoPrice"]}
      showGradients={true}
      yAxisFormatter={(value) => `${value.toFixed(1)} лв`}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
