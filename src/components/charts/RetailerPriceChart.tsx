import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";

interface RetailerPriceChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  retailer: string;
  retailPrice: number;
  promoPrice: number;
}

function processRetailerPriceData(resultSet: any) {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const retailerMap = new Map<
      string,
      { retailPrice: number; promoPrice: number; count: number }
    >();

    pivot.forEach((row: any) => {
      const retailer = row["prices.retailer_name"];
      const retailPrice = Number(row["prices.averageRetailPrice"] || 0);
      const promoPrice = Number(row["prices.averagePromoPrice"] || 0);

      if (!retailer) return;

      if (retailerMap.has(retailer)) {
        const existing = retailerMap.get(retailer)!;
        existing.retailPrice =
          (existing.retailPrice * existing.count + retailPrice) /
          (existing.count + 1);
        existing.promoPrice =
          (existing.promoPrice * existing.count + promoPrice) /
          (existing.count + 1);
        existing.count += 1;
      } else {
        retailerMap.set(retailer, { retailPrice, promoPrice, count: 1 });
      }
    });

    return Array.from(retailerMap.entries())
      .map(([retailer, data]) => ({
        retailer,
        retailPrice: data.retailPrice,
        promoPrice: data.promoPrice,
      }))
      .sort(
        (a: ChartDataPoint, b: ChartDataPoint) => b.retailPrice - a.retailPrice
      );
  } catch (error) {
    console.error("Error processing retailer price data:", error);
    return [];
  }
}

export function RetailerPriceChart({ globalFilters }: RetailerPriceChartProps) {
  const query = useMemo(() => {
    // For RetailerPriceChart, we need to ensure retailer dimension is always included
    // even when retailers are filtered, to show breakdown by retailer
    const query = buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
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
      (globalFilters.retailers || []).join(","),
      (globalFilters.settlements || []).join(","),
      (globalFilters.municipalities || []).join(","),
      (globalFilters.categories || []).join(","),
      globalFilters.datePreset || "last7days",
    ],
    "retailer-price-chart"
  );

  const data = useMemo(() => {
    return processRetailerPriceData(resultSet);
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Average Price by Retailer"
      description="Compare retail vs promotional prices across retailers"
      isLoading={isLoading}
      error={error}
      progress={progress}
      chartType="bar"
      data={data}
      chartConfigType="trend"
      xAxisKey="retailer"
      dataKeys={["retailPrice", "promoPrice"]}
      height="large"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
