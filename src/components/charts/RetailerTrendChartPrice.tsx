import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "@/config/ChartWrapper";

interface RetailerTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  [retailer: string]: any;
}

function processRetailerPriceData(resultSet: any, granularity: string = "day") {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const dataMap = new Map();

    pivot.forEach((row: any) => {
      const dateKey = `prices.price_date.${granularity}`;
      const date = row[dateKey] || row["prices.price_date"];
      const retailer = row["prices.retailer_name"];
      const price = Number(row["prices.averageRetailPrice"] || 0);

      if (!date || !retailer) return;

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const dateEntry = dataMap.get(date);
      dateEntry[retailer] = price > 0 ? price : null;
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error("Error processing retailer price data:", error);
    return [];
  }
}

function extractRetailers(resultSet: any): string[] {
  if (!resultSet) return [];
  
  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const retailerSet = new Set<string>();
    pivot.forEach((row: any) => {
      if (row["prices.retailer_name"]) {
        retailerSet.add(row["prices.retailer_name"]);
      }
    });
    return Array.from(retailerSet);
  } catch (error) {
    console.error("Error extracting retailers:", error);
    return [];
  }
}

function calculateRetailerTrend(data: any[], retailers: string[]) {
  if (data.length < 2 || retailers.length === 0) return undefined;
  
  const firstRetailer = retailers[0];
  const first = data[0][firstRetailer];
  const last = data[data.length - 1][firstRetailer];
  
  if (!first || first === 0) return undefined;
  
  const change = ((last - first) / first) * 100;
  return {
    value: change.toFixed(1),
    direction: change > 0 ? "up" as const : "down" as const,
  };
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function RetailerTrendChartPrice({
  globalFilters,
}: RetailerTrendChartProps) {
  // Build the query
  const query = useMemo(() => {
    console.log(
      "🔧 RetailerTrendChartPrice building query with globalFilters:",
      globalFilters
    );
    // For RetailerTrendChartPrice, we need to ensure retailer dimension is always included
    // even when retailers are filtered, to show breakdown by retailer
    const query = buildOptimizedQuery(
      ["prices.averageRetailPrice"],
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
    "retailer-trend-price-chart"
  );

  const data = useMemo(() => {
    return processRetailerPriceData(resultSet, globalFilters.granularity);
  }, [resultSet, globalFilters.granularity]);

  const retailers = useMemo(() => {
    return extractRetailers(resultSet);
  }, [resultSet]);

  const trend = useMemo(() => {
    return calculateRetailerTrend(data, retailers);
  }, [data, retailers]);

  return (
    <ChartWrapper
      title="Retailer Price Trends"
      description="Compare how different retailers' retail prices change over time (separate line per retailer)"
      isLoading={isLoading}
      error={error}
      progress={progress}
      trend={trend}
      height="medium"
      chartType="multiline"
      data={data}
      xAxisKey="date"
      xAxisFormatter={formatDate}
      yAxisFormatter={(value) => `${value.toFixed(1)} лв`}
      dynamicKeys={retailers}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
