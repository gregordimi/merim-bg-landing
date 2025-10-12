import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "@/config/ChartWrapper";

interface TrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  retailPrice: number;
  promoPrice: number;
  retailPriceCount: number;
  promoPriceCount: number;
}

export function TrendChart({ globalFilters }: TrendChartProps) {

  // Build the query
  const query = useMemo(() => {
    console.log(
      "🔧 TrendChart building query with globalFilters:",
      globalFilters
    );
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



  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    // Group by date and aggregate multiple dimension values
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
          retailPrices: [],
          promoPrices: [],
        });
      }

      const dateEntry = dataMap.get(date);
      if (retailPrice > 0) dateEntry.retailPrices.push(retailPrice);
      if (promoPrice > 0) dateEntry.promoPrices.push(promoPrice);
    });

    // Calculate averages for each date
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
  }, [resultSet, globalFilters.granularity]);

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

  // Calculate trend for display
  const trend = useMemo(() => {
    if (!displayData || displayData.length < 2) return null;
    const first = displayData[0].retailPrice;
    const last = displayData[displayData.length - 1].retailPrice;
    if (first === 0) return null;
    const change = ((last - first) / first) * 100;
    return {
      value: change.toFixed(1),
      direction: change > 0 ? ("up" as const) : ("down" as const),
    };
  }, [displayData]);

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
      data={displayData}
      chartConfigType="trend"
      xAxisKey="date"
      xAxisFormatter={formatDate}
      yAxisFormatter={(value) => `${value.toFixed(1)} лв`}
      dataKeys={['retailPrice', 'promoPrice']}
      showGradients={true}

      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
