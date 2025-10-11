import { useMemo } from "react";
import {
  GlobalFilters,
  buildFilters,
  buildTimeDimensions,
} from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { Card, CardContent } from "@/components/ui/card";

// measures: {
//     count: {
//       type: `count`
//     },
//     averageRetailPrice: {
//       sql: `NULLIF(${CUBE}.retail_price, 0)`,
//       type: `avg`,
//       format: `currency`
//     },
//     averagePromoPrice: {
//       sql: `NULLIF(${CUBE}.promo_price, 0)`,
//       type: `avg`,
//       format: `currency`
//     },
//     totalRetailPrice: {
//       sql: `NULLIF(${CUBE}.retail_price, 0)`,
//       type: `sum`,
//       format: `currency`
//     },
//     totalPromoPrice: {
//       sql: `NULLIF(${CUBE}.promo_price, 0)`,
//       type: `sum`,
//       format: `currency`
//     },
//     retailPriceCount: {
//       sql: `CASE WHEN NULLIF(${CUBE}.retail_price, 0) IS NOT NULL THEN 1 ELSE 0 END`,
//       type: `sum`
//     },
//     promoPriceCount: {
//       sql: `CASE WHEN NULLIF(${CUBE}.promo_price, 0) IS NOT NULL THEN 1 ELSE 0 END`,
//       type: `sum`
//     },
//     minRetailPrice: {
//       sql: `NULLIF(${CUBE}.retail_price, 0)`,
//       type: `min`,
//       format: `currency`
//     },
//     minPromoPrice: {
//       sql: `NULLIF(${CUBE}.promo_price, 0)`,
//       type: `min`,
//       format: `currency`
//     },
//     maxRetailPrice: {
//       sql: `NULLIF(${CUBE}.retail_price, 0)`,
//       type: `max`,
//       format: `currency`
//     },
//     maxPromoPrice: {
//       sql: `NULLIF(${CUBE}.promo_price, 0)`,
//       type: `max`,
//       format: `currency`
//     },
//     medianRetailPrice: {
//       sql: `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY NULLIF(${CUBE}.retail_price, 0))`,
//       type: `number`,
//       format: `currency`
//     },
//     medianPromoPrice: {
//       sql: `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY NULLIF(${CUBE}.promo_price, 0))`,
//       type: `number`,
//       format: `currency`
//     },
//     averageDiscountPercentage: {
//       title: "Average Discount %",
//       sql: `(${CUBE.averageRetailPrice} - ${CUBE.averagePromoPrice}) / ${CUBE.averageRetailPrice}`,
//       type: `number`,
//       format: `percent`
//     }

interface StatsCardsProps {
  globalFilters: GlobalFilters;
}

interface StatsData {
  count: number;
  minRetailPrice: number;
  maxRetailPrice: number;
  minPromoPrice: number;
  maxPromoPrice: number;
  avgRetailPrice: number;
  avgPromoPrice: number;
  totalRetailPrice: number;
  totalPromoPrice: number;
  retailPriceCount: number;
  promoPriceCount: number;
  medianRetailPrice: number;
  medianPromoPrice: number;
  averageDiscountPercentage: number;
}

export function StatsCards({ globalFilters }: StatsCardsProps) {
  const { resultSet, isLoading, error } = useStableQuery(
    () => ({
      measures: [
        "prices.count",
        "prices.averageRetailPrice",
        "prices.averagePromoPrice",
        "prices.totalRetailPrice",
        "prices.totalPromoPrice",
        "prices.retailPriceCount",
        "prices.promoPriceCount",
        "prices.minRetailPrice",
        "prices.minPromoPrice",
        "prices.maxRetailPrice",
        "prices.maxPromoPrice",
        "prices.medianRetailPrice",
        "prices.medianPromoPrice",
        "prices.averageDiscountPercentage",
      ],
      filters: buildFilters(globalFilters),
      timeDimensions: buildTimeDimensions(globalFilters.datePreset),
    }),
    [
      (globalFilters.retailers || []).join(","),
      (globalFilters.settlements || []).join(","),
      (globalFilters.municipalities || []).join(","),
      (globalFilters.categories || []).join(","),
      globalFilters.datePreset || "last7days",
    ],
    "stats-cards"
  );

  const statsData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) {
      // Return zeros when no data is found
      return {
        count: 0,
        minRetailPrice: 0,
        maxRetailPrice: 0,
        minPromoPrice: 0,
        maxPromoPrice: 0,
        avgRetailPrice: 0,
        avgPromoPrice: 0,
        totalRetailPrice: 0,
        totalPromoPrice: 0,
        retailPriceCount: 0,
        promoPriceCount: 0,
        medianRetailPrice: 0,
        medianPromoPrice: 0,
        averageDiscountPercentage: 0,
      };
    }

    const data = pivot[0];
    const count = Number(data?.["prices.count"] || 0);
    const minRetailPrice = Number(data?.["prices.minRetailPrice"] || 0);
    const maxRetailPrice = Number(data?.["prices.maxRetailPrice"] || 0);
    const minPromoPrice = Number(data?.["prices.minPromoPrice"] || 0);
    const maxPromoPrice = Number(data?.["prices.maxPromoPrice"] || 0);
    const avgRetailPrice = Number(data?.["prices.averageRetailPrice"] || 0);
    const avgPromoPrice = Number(data?.["prices.averagePromoPrice"] || 0);
    const totalRetailPrice = Number(data?.["prices.totalRetailPrice"] || 0);
    const totalPromoPrice = Number(data?.["prices.totalPromoPrice"] || 0);
    const retailPriceCount = Number(data?.["prices.retailPriceCount"] || 0);
    const promoPriceCount = Number(data?.["prices.promoPriceCount"] || 0);
    const medianRetailPrice = Number(data?.["prices.medianRetailPrice"] || 0);
    const medianPromoPrice = Number(data?.["prices.medianPromoPrice"] || 0);
    const averageDiscountPercentage = Number(
      data?.["prices.averageDiscountPercentage"] || 0
    );

    return {
      count,
      minRetailPrice,
      maxRetailPrice,
      minPromoPrice,
      maxPromoPrice,
      avgRetailPrice,
      avgPromoPrice,
      totalRetailPrice,
      totalPromoPrice,
      retailPriceCount,
      promoPriceCount,
      medianRetailPrice,
      medianPromoPrice,
      averageDiscountPercentage,
    };
  }, [resultSet, globalFilters]);

  // Helper function to format currency
  const formatCurrency = (value: number) => `${value.toFixed(2)} лв`;

  // Helper function to format percentage
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Helper function to format number
  const formatNumber = (value: number) => value.toLocaleString();

  const renderCard = (
    title: string,
    value: string | number,
    formatter?: (val: number) => string
  ) => (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold mt-2">
          {isLoading
            ? "Loading..."
            : error
            ? "Error loading"
            : statsData
            ? formatter
              ? formatter(Number(value))
              : value
            : "No data"}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Count Statistics */}
      {renderCard("Total Records", statsData?.count || 0, formatNumber)}
      {renderCard(
        "Retail Price Records",
        statsData?.retailPriceCount || 0,
        formatNumber
      )}
      {renderCard(
        "Promo Price Records",
        statsData?.promoPriceCount || 0,
        formatNumber
      )}

      {/* Price Range - Retail */}
      {renderCard(
        "Min Retail Price",
        statsData?.minRetailPrice || 0,
        formatCurrency
      )}
      {renderCard(
        "Max Retail Price",
        statsData?.maxRetailPrice || 0,
        formatCurrency
      )}
      {renderCard(
        "Median Retail Price",
        statsData?.medianRetailPrice || 0,
        formatCurrency
      )}
      {renderCard(
        "Average Retail Price",
        statsData?.avgRetailPrice || 0,
        formatCurrency
      )}
      {renderCard(
        "Total Retail Value",
        statsData?.totalRetailPrice || 0,
        formatCurrency
      )}

      {/* Price Range - Promo */}
      {renderCard(
        "Min Promo Price",
        statsData?.minPromoPrice || 0,
        formatCurrency
      )}
      {renderCard(
        "Max Promo Price",
        statsData?.maxPromoPrice || 0,
        formatCurrency
      )}
      {renderCard(
        "Median Promo Price",
        statsData?.medianPromoPrice || 0,
        formatCurrency
      )}
      {renderCard(
        "Average Promo Price",
        statsData?.avgPromoPrice || 0,
        formatCurrency
      )}
      {renderCard(
        "Total Promo Value",
        statsData?.totalPromoPrice || 0,
        formatCurrency
      )}

      {/* Discount Analysis */}
      {renderCard(
        "Average Discount",
        statsData?.averageDiscountPercentage || 0,
        formatPercentage
      )}
    </div>
  );
}
