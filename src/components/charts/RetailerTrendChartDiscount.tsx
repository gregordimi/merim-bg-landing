import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";

interface RetailerTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  [retailer: string]: any;
}

export function RetailerTrendChartDiscount({
  globalFilters,
}: RetailerTrendChartProps) {
  // Build the query
  const query = useMemo(() => {
    console.log(
      "🔧 RetailerTrendChartDiscount building query with globalFilters:",
      globalFilters
    );
    // For RetailerTrendChartDiscount, we need to ensure retailer dimension is always included
    // even when retailers are filtered, to show breakdown by retailer
    const query = buildOptimizedQuery(
      ["prices.averageDiscountPercentage"],
      globalFilters,
      [] // Don't pass additional dimensions here
    );

    // Force include retailer dimension for this chart
    if (!query.dimensions) {
      query.dimensions = [];
    }
    if (!query.dimensions.includes("prices.retailer_name")) {
      query.dimensions.push("prices.retailer_name");
    }

    return query;
  }, [globalFilters]);

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
    "retailer-trend-discount-chart"
  );

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    // Group data by date and aggregate multiple retailer values
    const dataMap = new Map();

    pivot.forEach((row: any) => {
      const granularity = globalFilters.granularity ?? "day";
      const dateKey = `prices.price_date.${granularity}`;
      const date = row[dateKey] || row["prices.price_date"];
      const retailer = row["prices.retailer_name"];
      const discount = Number(row["prices.averageDiscountPercentage"] || 0);

      if (!date || !retailer) return; // Skip rows without date or retailer

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const dateEntry = dataMap.get(date);
      // Convert to percentage for display
      dateEntry[retailer] = discount > 0 ? discount * 100 : null;
    });

    // Convert to array and sort by date
    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [resultSet, globalFilters.granularity]);

  // Get unique retailers for line colors
  const retailers = useMemo(() => {
    if (!resultSet) return [];
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const retailerSet = new Set();
    pivot.forEach((row: any) => {
      if (row["prices.retailer_name"]) {
        retailerSet.add(row["prices.retailer_name"]);
      }
    });
    return Array.from(retailerSet) as string[];
  }, [resultSet]);

  // Use chart data directly
  const displayData = chartData;

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

  // Calculate trend for the first retailer (if available)
  const trend = useMemo(() => {
    if (
      !displayData ||
      displayData.length < 2 ||
      !retailers ||
      retailers.length === 0
    )
      return null;
    const firstRetailer = retailers[0];
    const first = displayData[0][firstRetailer];
    const last = displayData[displayData.length - 1][firstRetailer];
    if (!first || first === 0) return null;
    const change = ((last - first) / first) * 100;
    return {
      value: change.toFixed(1),
      direction: change > 0 ? ("up" as const) : ("down" as const),
    };
  }, [displayData, retailers]);

  return (
    <ChartWrapper
      title="Retailer Discount Trends"
      description="Compare how discount rates change over time by retailer (separate line per retailer)"
      isLoading={isLoading}
      error={error}
      progress={progress}
      trend={trend}
      height="medium"
      chartType="multiline"
      data={displayData}
      xAxisKey="date"
      xAxisFormatter={formatDate}
      yAxisFormatter={(value) => `${value.toFixed(1)}%`}
      dynamicKeys={retailers}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
