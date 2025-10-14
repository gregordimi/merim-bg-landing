import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";
import { formatDate } from "@/utils/dateUtils";

interface CategoryTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  [category: string]: any;
}

function processCategoryData(resultSet: any, granularity: string = "day") {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const dataMap = new Map();

    pivot.forEach((row: any) => {
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

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error("Error processing category data:", error);
    return [];
  }
}

function extractCategories(resultSet: any): string[] {
  if (!resultSet) return [];
  
  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const categorySet = new Set<string>();
    pivot.forEach((row: any) => {
      if (row["prices.category_group_name"]) {
        categorySet.add(row["prices.category_group_name"]);
      }
    });
    return Array.from(categorySet);
  } catch (error) {
    console.error("Error extracting categories:", error);
    return [];
  }
}

function calculateCategoryTrend(data: any[], categories: string[]) {
  if (data.length < 2 || categories.length === 0) return undefined;
  
  const firstCategory = categories[0];
  const first = data[0][firstCategory];
  const last = data[data.length - 1][firstCategory];
  
  if (!first || first === 0) return undefined;
  
  const change = ((last - first) / first) * 100;
  return {
    value: change.toFixed(1),
    direction: change > 0 ? "up" as const : "down" as const,
  };
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

  const data = useMemo(() => {
    return processCategoryData(resultSet, globalFilters.granularity);
  }, [resultSet, globalFilters.granularity]);

  const categories = useMemo(() => {
    return extractCategories(resultSet);
  }, [resultSet]);

  const trend = useMemo(() => {
    return calculateCategoryTrend(data, categories);
  }, [data, categories]);

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
      data={data}
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