import { useMemo, useCallback } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";

type MetricType = 'price' | 'promo' | 'discount';

interface RetailerTrendChartProps {
  globalFilters: GlobalFilters;
  metricType: MetricType;
}

const METRIC_CONFIG = {
  price: {
    measure: "prices.averageRetailPrice",
    title: "Retailer Price Trends",
    description: "Compare how different retailers' retail prices change over time (separate line per retailer)",
    formatter: (value: number) => `${value.toFixed(1)} лв`,
    componentId: "retailer-trend-price-chart"
  },
  promo: {
    measure: "prices.averagePromoPrice", 
    title: "Retailer Promo Price Trends",
    description: "Compare how different retailers' promotional prices change over time (separate line per retailer)",
    formatter: (value: number) => `${value.toFixed(1)} лв`,
    componentId: "retailer-trend-promo-chart"
  },
  discount: {
    measure: "prices.averageDiscountPercentage",
    title: "Retailer Discount Trends", 
    description: "Compare how discount rates change over time by retailer (separate line per retailer)",
    formatter: (value: number) => `${value.toFixed(1)}%`,
    componentId: "retailer-trend-discount-chart"
  }
};

function processRetailerData(resultSet: any, granularity: string = "day", metricType: MetricType) {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const config = METRIC_CONFIG[metricType];
    // console.log(`🔍 Processing ${metricType} data, pivot length:`, pivot.length);

    const dataMap = new Map();

    pivot.forEach((row: any) => {
      const dateKey = `prices.price_date.${granularity}`;
      const date = row[dateKey] || row["prices.price_date"];
      const retailer = row["prices.retailer_name"];
      const value = Number(row[config.measure] || 0);

      if (!date || !retailer) return;

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const dateEntry = dataMap.get(date);
      // Include 0 values as they represent valid data
      dateEntry[retailer] = value >= 0 ? value : null;
    });

    const result = Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // console.log(`🔍 Processed ${metricType} data length:`, result.length);

    return result;
  } catch (error) {
    console.error(`Error processing retailer ${metricType} data:`, error);
    return [];
  }
}

function extractRetailers(resultSet: any): string[] {
  if (!resultSet) return []; // This can return [] since it's just for keys
  
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

export function RetailerTrendChart({
  globalFilters,
  metricType
}: RetailerTrendChartProps) {
  const config = METRIC_CONFIG[metricType];

  // Build the query with more stable dependencies
  const query = useMemo(() => {
    const query = buildOptimizedQuery(
      [config.measure],
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

    // Create a stable reference by stringifying and parsing
    return JSON.parse(JSON.stringify(query));
  }, [
    // Use the same dependencies as useStableQuery to prevent mismatches
    globalFilters.retailers?.join(",") ?? "",
    globalFilters.settlements?.join(",") ?? "",
    globalFilters.municipalities?.join(",") ?? "",
    globalFilters.categories?.join(",") ?? "",
    globalFilters.datePreset ?? "last7days",
    globalFilters.granularity ?? "day",
    config.measure
  ]);

  const { resultSet, isLoading, error, progress, refetch } = useStableQuery(
    () => query,
    [
      globalFilters.retailers?.join(",") ?? "",
      globalFilters.settlements?.join(",") ?? "",
      globalFilters.municipalities?.join(",") ?? "",
      globalFilters.categories?.join(",") ?? "",
      globalFilters.datePreset ?? "last7days",
      globalFilters.granularity ?? "day",
    ],
    config.componentId
  );

  const handleReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const data = useMemo(() => {
    if (!resultSet) return [];
    return processRetailerData(resultSet, globalFilters.granularity, metricType);
  }, [resultSet, globalFilters.granularity, metricType]);

  const retailers = useMemo(() => {
    return extractRetailers(resultSet);
  }, [resultSet]);

  const trend = useMemo(() => {
    return calculateRetailerTrend(data, retailers);
  }, [data, retailers]);

  // Just use the original isLoading from the API
  const isDataReady = !isLoading;

  return (
    <ChartWrapper
      title={config.title}
      description={config.description}
      isLoading={isLoading}
      error={error}
      progress={progress}
      trend={trend}
      height="medium"
      chartType="multiline"
      data={data}
      xAxisKey="date"
      xAxisFormatter={formatDate}
      yAxisFormatter={config.formatter}
      dynamicKeys={retailers}
      onReload={handleReload}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}