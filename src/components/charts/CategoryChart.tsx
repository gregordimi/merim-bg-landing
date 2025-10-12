import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "@/config/ChartWrapper";

interface CategoryChartProps {
  globalFilters: GlobalFilters;
}

export function CategoryChart({ globalFilters }: CategoryChartProps) {
  // Build the query
  const query = useMemo(() => {
    // For CategoryChart, we need to ensure category dimension is always included
    // even when categories are filtered, to show breakdown by category
    const query = buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters,
      [] // Don't pass additional dimensions here
    );

    // Force include category dimension for this chart
    if (!query.dimensions) {
      query.dimensions = [];
    }
    if (!query.dimensions.includes("prices.category_group_name")) {
      query.dimensions.push("prices.category_group_name");
    }

    return query;
  }, [globalFilters]);

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      (globalFilters.retailers || []).join(","),
      (globalFilters.settlements || []).join(","),
      (globalFilters.municipalities || []).join(","),
      (globalFilters.categories || []).join(","),
      globalFilters.datePreset || "last7days",
    ],
    "category-chart"
  );

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    // Group by category to handle any potential duplicates
    const categoryMap = new Map<
      string,
      { retailPrice: number; promoPrice: number; count: number }
    >();

    pivot.forEach((row: any) => {
      const category = row["prices.category_group_name"];
      const retailPrice = Number(row["prices.averageRetailPrice"] || 0);
      const promoPrice = Number(row["prices.averagePromoPrice"] || 0);

      if (!category) return; // Skip rows without category

      if (categoryMap.has(category)) {
        // If duplicate, average the values
        const existing = categoryMap.get(category)!;
        existing.retailPrice =
          (existing.retailPrice * existing.count + retailPrice) /
          (existing.count + 1);
        existing.promoPrice =
          (existing.promoPrice * existing.count + promoPrice) /
          (existing.count + 1);
        existing.count += 1;
      } else {
        categoryMap.set(category, { retailPrice, promoPrice, count: 1 });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        retailPrice: data.retailPrice,
        promoPrice: data.promoPrice,
      }))
      .sort((a, b) => b.retailPrice - a.retailPrice) // Sort by retail price descending
      .slice(0, 20); // Limit to top 20
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Average Retail & Promo Prices by Category"
      description="Compare retail and promotional prices across product categories"
      isLoading={isLoading}
      error={error}
      progress={progress}
      height="large"
      chartType="bar"
      data={chartData}
      chartConfigType="category"
      xAxisKey="category"
      yAxisFormatter={(value) => `${value.toFixed(1)} лв`}
      dataKeys={["retailPrice", "promoPrice"]}
      barRadius={[2, 2, 0, 0]}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
