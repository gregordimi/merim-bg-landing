/**
 * Optimized Trend Chart - Uses pre-aggregation matching queries
 */

import { useMemo } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import { ChartWrapper } from "../../config/ChartWrapper";
import { getChartConfig, CHART_HEIGHTS } from "@/config/chartConfig";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";

interface OptimizedTrendChartProps {
  globalFilters: GlobalFilters;
}

export function OptimizedTrendChart({
  globalFilters,
}: OptimizedTrendChartProps) {
  // Get chart configuration for trend charts
  const chartConfig = getChartConfig("trend");

  // Build optimized query that matches pre-aggregations
  const query = useMemo(
    () =>
      buildOptimizedQuery(
        ["prices.averageRetailPrice", "prices.averagePromoPrice"],
        globalFilters
      ),
    [globalFilters]
  );

  const { resultSet, isLoading, error } = useCubeQuery(query);

  const chartData = useMemo(() => {
    if (!resultSet) return [];

    const pivot = resultSet.tablePivot();
    const dataMap = new Map();

    pivot.forEach((row: any) => {
      const granularity = globalFilters.granularity ?? "day";
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
  }, [resultSet, globalFilters.granularity]);

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

  return (
    <ChartWrapper
      title="📈 Price Trends (Optimized)"
      description="Retail and promotional price trends over time - uses pre-aggregations for fast performance"
      isLoading={isLoading}
      error={error}
      trend={trend}
      height="medium"
      chartType="area"
      data={chartData}
      chartConfigType="trend"
      xAxisKey="date"
      xAxisFormatter={formatDate}
      yAxisFormatter={(value) => `${value.toFixed(1)} лв`}
      dataKeys={['retailPrice', 'promoPrice']}
      showGradients={true}
    />
  );
}
