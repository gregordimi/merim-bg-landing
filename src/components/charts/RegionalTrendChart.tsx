import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";

interface RegionalTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  [municipality: string]: any;
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

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    // Group data by date and aggregate multiple municipality values
    const dataMap = new Map();

    pivot.forEach((row: any) => {
      const granularity = globalFilters.granularity ?? "day";
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

    // Convert to array and sort by date
    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [resultSet, globalFilters.granularity]);

  // Get unique municipalities for line colors
  const municipalities = useMemo(() => {
    if (!resultSet) return [];
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const municipalitySet = new Set();
    pivot.forEach((row: any) => {
      if (row["prices.municipality_name"]) {
        municipalitySet.add(row["prices.municipality_name"]);
      }
    });
    return Array.from(municipalitySet) as string[];
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

  // Calculate trend for the first municipality (if available)
  const trend = useMemo(() => {
    if (
      !displayData ||
      displayData.length < 2 ||
      !municipalities ||
      municipalities.length === 0
    )
      return null;
    const firstMunicipality = municipalities[0];
    const first = displayData[0][firstMunicipality];
    const last = displayData[displayData.length - 1][firstMunicipality];
    if (!first || first === 0) return null;
    const change = ((last - first) / first) * 100;
    return {
      value: change.toFixed(1),
      direction: change > 0 ? ("up" as const) : ("down" as const),
    };
  }, [displayData, municipalities]);

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
      data={displayData}
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
