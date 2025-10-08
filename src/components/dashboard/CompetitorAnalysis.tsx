/**
 * Competitor Analysis Tab
 *
 * A focused view for direct comparison of retailers' pricing strategies
 */

import { useCubeQuery } from "@cubejs-client/react";
import { isQueryPresent } from "@cubejs-client/core";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GlobalFilters } from "@/utils/cube/filterUtils";
import { ChartViewer } from "@/utils/cube/ChartViewer";
import {
  ChartAreaSkeleton,
  CubeQueryWrapper,
} from "@/utils/cube/components/ChartSkeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CompetitorAnalysisProps {
  globalFilters: GlobalFilters;
}

export default function CompetitorAnalysis({
  globalFilters,
}: CompetitorAnalysisProps) {
  // Build filters once and memoize them properly
  const filters = useMemo(() => {
    const filterArray = [];
    if (globalFilters.retailers && globalFilters.retailers.length > 0) {
      filterArray.push({
        member: "retailers.name",
        operator: "equals" as const,
        values: globalFilters.retailers,
      });
    }
    if (globalFilters.settlements && globalFilters.settlements.length > 0) {
      filterArray.push({
        member: "settlements.name_bg",
        operator: "equals" as const,
        values: globalFilters.settlements,
      });
    }
    if (globalFilters.municipalities && globalFilters.municipalities.length > 0) {
      filterArray.push({
        member: "municipality.name",
        operator: "equals" as const,
        values: globalFilters.municipalities,
      });
    }
    if (globalFilters.categories && globalFilters.categories.length > 0) {
      filterArray.push({
        member: "category_groups.name",
        operator: "equals" as const,
        values: globalFilters.categories,
      });
    }
    return filterArray;
  }, [
    globalFilters.retailers,
    globalFilters.settlements,
    globalFilters.municipalities,
    globalFilters.categories,
  ]);

  // Memoize time dimensions
  const timeDimensions = useMemo(() => {
    return globalFilters.dateRange
      ? [
          {
            dimension: "prices.price_date",
            dateRange: globalFilters.dateRange,
          },
        ]
      : [
          {
            dimension: "prices.price_date",
            granularity: "day" as const,
            dateRange: "Last 30 days" as const,
          },
        ];
  }, [globalFilters.dateRange]);

  // Memoize queries to prevent unnecessary re-execution
  const retailerTrendQuery = useMemo(
    () => ({
      dimensions: ["retailers.name"],
      measures: ["prices.averageRetailPrice"],
      timeDimensions: globalFilters.dateRange
        ? [
            {
              dimension: "prices.price_date",
              granularity: "day" as const,
              dateRange: globalFilters.dateRange,
            },
          ]
        : [
            {
              dimension: "prices.price_date",
              granularity: "day" as const,
              dateRange: "Last 30 days" as const,
            },
          ],
      filters: filters,
      order: { "prices.price_date": "asc" as const },
    }),
    [globalFilters.dateRange, filters]
  );

  const avgPriceQuery = useMemo(
    () => ({
      dimensions: ["retailers.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: globalFilters.dateRange
        ? [
            {
              dimension: "prices.price_date",
              dateRange: globalFilters.dateRange,
            },
          ]
        : [],
      filters: filters,
      order: { "prices.averageRetailPrice": "desc" as const },
    }),
    [globalFilters.dateRange, filters]
  );

  const discountQuery = useMemo(
    () => ({
      dimensions: ["retailers.name"],
      measures: ["prices.averageDiscountPercentage"],
      timeDimensions: globalFilters.dateRange
        ? [
            {
              dimension: "prices.price_date",
              dateRange: globalFilters.dateRange,
            },
          ]
        : [],
      filters: filters,
      order: { "prices.averageDiscountPercentage": "desc" as const },
    }),
    [globalFilters.dateRange, filters]
  );

  // Use useCubeQuery with optimal options
  const queryOptions = useMemo(
    () => ({
      castNumerics: true, // Auto-convert numbers - fixes .toFixed() errors
      resetResultSetOnChange: false, // Prevent data from disappearing
      subscribe: false, // Disable real-time for now to reduce load
    }),
    []
  );

  // Execute queries with staggered loading to reduce server load
  const {
    resultSet: retailerTrendResult,
    isLoading: trendLoading,
    error: trendError,
    progress: trendProgress,
  } = useCubeQuery(retailerTrendQuery, {
    ...queryOptions,
    skip: !isQueryPresent(retailerTrendQuery),
  });

  // Only run avg price query after trend is done or has data
  const {
    resultSet: avgPriceResult,
    isLoading: avgLoading,
    error: avgError,
    progress: avgProgress,
  } = useCubeQuery(avgPriceQuery, {
    ...queryOptions,
    skip:
      !isQueryPresent(avgPriceQuery) || (trendLoading && !retailerTrendResult),
  });

  // Only run discount query after avg price is done or has data
  const {
    resultSet: discountResult,
    isLoading: discountLoading,
    error: discountError,
    progress: discountProgress,
  } = useCubeQuery(discountQuery, {
    ...queryOptions,
    skip: !isQueryPresent(discountQuery) || (avgLoading && !avgPriceResult),
  });

  return (
    <div className="space-y-6">
      {/* Retailer Price Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Retailer Price Trends</CardTitle>
          <CardDescription>
            Compare how different retailers' prices change over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RetailerTrendChart
            resultSet={retailerTrendResult}
            isLoading={trendLoading}
            error={trendError}
            progress={trendProgress}
          />
        </CardContent>
      </Card>

      {/* Average Price Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Price by Retailer</CardTitle>
            <CardDescription>
              Compare retail vs promotional prices across retailers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RetailerPriceChart
              resultSet={avgPriceResult}
              isLoading={avgLoading}
              error={avgError}
              progress={avgProgress}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discount Rates by Retailer</CardTitle>
            <CardDescription>
              See which retailers offer the best discounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DiscountChart
              resultSet={discountResult}
              isLoading={discountLoading}
              error={discountError}
              progress={discountProgress}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Custom Retailer Trend Chart Component
function RetailerTrendChart({ resultSet, isLoading, error, progress }: any) {
  const chartData = useMemo(() => {
    if (!resultSet) return [];

    const pivot = resultSet.tablePivot();
    console.log("Trend chart raw data:", pivot);

    const dataMap = new Map();

    // Group data by date
    pivot.forEach((row: any) => {
      const date = row["prices.price_date.day"] || row["prices.price_date"];
      const retailer = row["retailers.name"];
      const price = Number(row["prices.averageRetailPrice"] || 0);

      console.log("Processing row:", { date, retailer, price });

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const dateEntry = dataMap.get(date);
      dateEntry[retailer] = price > 0 ? price : null; // Use null for missing data
    });

    // Convert to array and sort by date
    const result = Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    console.log("Processed chart data:", result);
    return result;
  }, [resultSet]);

  // Get unique retailers for line colors
  const retailers = useMemo(() => {
    if (!resultSet) return [];
    const pivot = resultSet.tablePivot();
    const retailerSet = new Set();
    pivot.forEach((row: any) => {
      if (row["retailers.name"]) {
        retailerSet.add(row["retailers.name"]);
      }
    });
    const result = Array.from(retailerSet);
    console.log("Unique retailers:", result);
    return result;
  }, [resultSet]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
  ];

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

  return (
    <CubeQueryWrapper isLoading={isLoading} error={error} progress={progress}>
      {chartData.length > 0 && retailers.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${Number(value).toFixed(2)} лв`,
                name,
              ]}
              labelFormatter={(date) => formatDate(date)}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            {retailers.map((retailer, index) => (
              <Line
                key={String(retailer)}
                type="monotone"
                dataKey={String(retailer)}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </CubeQueryWrapper>
  );
}

// Custom Retailer Price Chart Component
function RetailerPriceChart({ resultSet, isLoading, error, progress }: any) {
  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      retailer: row["retailers.name"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  return (
    <CubeQueryWrapper isLoading={isLoading} error={error} progress={progress}>
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="retailer"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const label =
                  props.dataKey === "retailPrice"
                    ? "Retail Price"
                    : "Promo Price";
                return [`${value.toFixed(2)} лв`, label];
              }}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Bar dataKey="retailPrice" fill="#0088FE" name="Retail Price" />
            <Bar dataKey="promoPrice" fill="#00C49F" name="Promo Price" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CubeQueryWrapper>
  );
}

// Custom Discount Chart Component
function DiscountChart({ resultSet, isLoading, error, progress }: any) {
  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      retailer: row["retailers.name"],
      discount: Number(row["prices.averageDiscountPercentage"] || 0),
    }));
  }, [resultSet]);

  return (
    <CubeQueryWrapper isLoading={isLoading} error={error} progress={progress}>
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="retailer"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
            <Tooltip
              formatter={(value: number) => [
                `${value.toFixed(1)}%`,
                "Discount Rate",
              ]}
              labelStyle={{ color: "#000" }}
            />
            <Bar dataKey="discount" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CubeQueryWrapper>
  );
}
