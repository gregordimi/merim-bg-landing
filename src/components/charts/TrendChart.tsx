import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "@/config/ChartWrapper";

interface TrendChartProps {
  globalFilters: GlobalFilters;
}

function processTrendData(resultSet: any, granularity: string = "day") {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const dataMap = new Map();

    pivot.forEach((row: any) => {
      const dateKey = `prices.price_date.${granularity}`;
      const date = row[dateKey] || row["prices.price_date"];
      const retailPrice = Number(row["prices.averageRetailPrice"] || 0);
      const promoPrice = Number(row["prices.averagePromoPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date,
          retailPrices: [],
          promoPrices: [],
        });
      }

      const dateEntry = dataMap.get(date);
      dateEntry.retailPrices.push(retailPrice);
      dateEntry.promoPrices.push(promoPrice);
    });

    return Array.from(dataMap.values())
      .map((entry) => ({
        date: entry.date,
        retailPrice:
          entry.retailPrices.length > 0
            ? entry.retailPrices.reduce(
                (sum: number, price: number) => sum + price,
                0
              ) / entry.retailPrices.length
            : 0,
        promoPrice:
          entry.promoPrices.length > 0
            ? entry.promoPrices.reduce(
                (sum: number, price: number) => sum + price,
                0
              ) / entry.promoPrices.length
            : 0,
        retailPriceCount: entry.retailPrices.length,
        promoPriceCount: entry.promoPrices.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Error processing trend data:", error);
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

export function TrendChart({ globalFilters }: TrendChartProps) {
  const query = useMemo(() => {
    return buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters
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
    "trend-chart"
  );

  const data = useMemo(() => {
    return processTrendData(resultSet, globalFilters.granularity);
  }, [resultSet, globalFilters.granularity]);

  const trend = useMemo(() => {
    return calculateTrend(data);
  }, [data]);

  return (
    <ChartWrapper
      title="Price Trends Over Time"
      description="Track retail and promotional price changes (aggregated when multiple dimension values exist per date)"
      isLoading={isLoading}
      error={error}
      progress={progress}
      trend={trend}
      height="medium"
      chartType="area"
      data={data}
      chartConfigType="trend"
      xAxisKey="date"
      xAxisFormatter={formatDate}
      yAxisFormatter={(value) => `${value.toFixed(1)} лв`}
      dataKeys={["retailPrice", "promoPrice"]}
      showGradients={true}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
