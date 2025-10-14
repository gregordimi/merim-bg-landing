import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";
import { formatDate } from "@/utils/dateUtils";

interface RegionalTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  [municipality: string]: any;
}

function processRegionalData(resultSet: any, granularity: string = "day") {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const dataMap = new Map();

    pivot.forEach((row: any) => {
      const dateKey = `prices.price_date.${granularity}`;
      const date = row[dateKey] || row["prices.price_date"];
      const municipality = row["prices.municipality_name"];
      const price = Number(row["prices.averageRetailPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const dateEntry = dataMap.get(date);
      dateEntry[municipality] = price > 0 ? price : null;
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error("Error processing regional data:", error);
    return [];
  }
}

function extractMunicipalities(resultSet: any): string[] {
  if (!resultSet) return [];
  
  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const municipalitySet = new Set<string>();
    pivot.forEach((row: any) => {
      if (row["prices.municipality_name"]) {
        municipalitySet.add(row["prices.municipality_name"]);
      }
    });
    return Array.from(municipalitySet);
  } catch (error) {
    console.error("Error extracting municipalities:", error);
    return [];
  }
}

function calculateRegionalTrend(data: any[], municipalities: string[]) {
  if (data.length < 2 || municipalities.length === 0) return undefined;
  
  const firstMunicipality = municipalities[0];
  const first = data[0][firstMunicipality];
  const last = data[data.length - 1][firstMunicipality];
  
  if (!first || first === 0) return undefined;
  
  const change = ((last - first) / first) * 100;
  return {
    value: change.toFixed(1),
    direction: change > 0 ? "up" as const : "down" as const,
  };
}


export function RegionalTrendChart({ globalFilters }: RegionalTrendChartProps) {
  // Build the query
  const query = useMemo(() => {
    console.log(
      "🔧 RegionalTrendChart building query with globalFilters:",
      globalFilters
    );
    return buildOptimizedQuery(
      ["prices.averageRetailPrice"],
      globalFilters,
      ["prices.municipality_name"] // Always include municipalities dimension
    );
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
    "regional-trend-chart"
  );

  const data = useMemo(() => {
    return processRegionalData(resultSet, globalFilters.granularity);
  }, [resultSet, globalFilters.granularity]);

  const municipalities = useMemo(() => {
    return extractMunicipalities(resultSet);
  }, [resultSet]);

  const trend = useMemo(() => {
    return calculateRegionalTrend(data, municipalities);
  }, [data, municipalities]);

  return (
    <ChartWrapper
      title="Regional Price Trends"
      description="Track how prices vary across different municipalities over time (separate line per municipality)"
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
      dynamicKeys={municipalities}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
