import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";

interface CategoryTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  [category: string]: any;
}

export function CategoryTrendChart({ globalFilters }: CategoryTrendChartProps) {
  // Build the query
  const query = useMemo(() => {
    console.log(
      "🔧 CategoryTrendChart building query with globalFilters:",
      globalFilters
    );
    return buildOptimizedQuery(
      ["prices.averageRetailPrice"],
      globalFilters,
      ["prices.category_group_name"] // Always include categories dimension
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
    "category-trend-chart"
  );

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    // Group data by date and aggregate multiple category values
    const dataMap = new Map();

    pivot.forEach((row: any) => {
      const granularity = globalFilters.granularity ?? "day";
      const dateKey = `prices.price_date.${granularity}`;
      const date = row[dateKey] || row["prices.price_date"];
      const category = row["prices.category_group_name"];
      const price = Number(row["prices.averageRetailPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const dateEntry = dataMap.get(date);
      dateEntry[category] = price > 0 ? price : null;
    });

    // Convert to array and sort by date
    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [resultSet, globalFilters.granularity]);

  // Get unique categories for line colors
  const categories = useMemo(() => {
    if (!resultSet) return [];
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const categorySet = new Set();
    pivot.forEach((row: any) => {
      if (row["prices.category_group_name"]) {
        categorySet.add(row["prices.category_group_name"]);
      }
    });
    return Array.from(categorySet) as string[];
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

  // Calculate trend for the first category (if available)
  const trend = useMemo(() => {
    if (
      !displayData ||
      displayData.length < 2 ||
      !categories ||
      categories.length === 0
    )
      return null;
    const firstCategory = categories[0];
    const first = displayData[0][firstCategory];
    const last = displayData[displayData.length - 1][firstCategory];
    if (!first || first === 0) return null;
    const change = ((last - first) / first) * 100;
    return {
      value: change.toFixed(1),
      direction: change > 0 ? ("up" as const) : ("down" as const),
    };
  }, [displayData, categories]);

  return (
    <ChartWrapper
      title="Category Price Trends"
      description="Track how prices change across different product categories over time (separate line per category)"
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
      dynamicKeys={categories}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}