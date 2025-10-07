/**
 * Executive Overview Tab
 *
 * High-level summary of key performance indicators and market trends
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
import { GlobalFilters } from "@/pages/DashboardPage";
import { ChartViewer } from "@/utils/cube/ChartViewer";
import {
  ChartAreaSkeleton,
  CubeQueryWrapper,
} from "@/utils/cube/components/ChartSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ExecutiveOverviewProps {
  globalFilters: GlobalFilters;
}

export default function ExecutiveOverview({
  globalFilters,
}: ExecutiveOverviewProps) {
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
    if (globalFilters.locations && globalFilters.locations.length > 0) {
      filterArray.push({
        member: "settlements.name_bg",
        operator: "equals" as const,
        values: globalFilters.locations,
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
    globalFilters.locations,
    globalFilters.categories,
  ]);

  // Simple stats query - no time dimensions to keep it stable
  const statsQuery = useMemo(
    () => ({
      measures: [
        "prices.minRetailPrice",
        "prices.maxRetailPrice",
        "prices.medianRetailPrice",
      ],
      filters: filters,
    }),
    [filters]
  );

  // Time dimensions for trend chart
  const timeDimensions = useMemo(() => {
    return globalFilters.dateRange
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
        ];
  }, [globalFilters.dateRange]);

  const trendQuery = useMemo(
    () => ({
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: timeDimensions,
      filters: filters,
      order: { "prices.price_date": "asc" as const },
    }),
    [timeDimensions, filters]
  );

  const categoryQuery = useMemo(
    () => ({
      dimensions: ["category_groups.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: globalFilters.dateRange
        ? [
            {
              dimension: "prices.price_date",
              dateRange: globalFilters.dateRange,
            },
          ]
        : [
            {
              dimension: "prices.price_date",
              dateRange: "Last 30 days" as const,
            },
          ],
      filters: filters,
      order: { "prices.averageRetailPrice": "desc" as const },
      limit: 20,
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

  // Execute queries with skip logic to prevent incomplete queries
  const {
    resultSet: statsResult,
    isLoading: statsLoading,
    error: statsError,
    progress: statsProgress,
  } = useCubeQuery(statsQuery, {
    ...queryOptions,
    skip: !isQueryPresent(statsQuery),
  });

  const {
    resultSet: trendResult,
    isLoading: trendLoading,
    error: trendError,
    progress: trendProgress,
  } = useCubeQuery(trendQuery, {
    ...queryOptions,
    skip: !isQueryPresent(trendQuery),
  });

  const {
    resultSet: categoryResult,
    isLoading: categoryLoading,
    error: categoryError,
    progress: categoryProgress,
  } = useCubeQuery(categoryQuery, {
    ...queryOptions,
    skip: !isQueryPresent(categoryQuery),
  });

  return (
    <div className="space-y-6">
      {/* Price Statistics Cards */}
      <StatsSection
        resultSet={statsResult}
        isLoading={statsLoading}
        error={statsError}
        progress={statsProgress}
      />

      {/* Price Trend Chart */}
      <TrendSection
        resultSet={trendResult}
        isLoading={trendLoading}
        error={trendError}
        progress={trendProgress}
      />

      {/* Category Distribution Chart */}
      <CategorySection
        resultSet={categoryResult}
        isLoading={categoryLoading}
        error={categoryError}
        progress={categoryProgress}
      />
    </div>
  );
}

// Stats Section Component
function StatsSection({ resultSet, isLoading, error, progress }: any) {
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-500">
              Error loading stats: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = useMemo(() => {
    if (!resultSet) return { minPrice: 0, maxPrice: 0, medianPrice: 0 };

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0)
      return { minPrice: 0, maxPrice: 0, medianPrice: 0 };

    const data = pivot[0];

    // With castNumerics: true, these should already be numbers
    return {
      minPrice: data?.["prices.minRetailPrice"] || 0,
      maxPrice: data?.["prices.maxRetailPrice"] || 0,
      medianPrice: data?.["prices.medianRetailPrice"] || 0,
    };
  }, [resultSet]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Minimum Price
          </p>
          <p className="text-3xl font-bold mt-2">
            {isLoading
              ? progress?.stage?.stage || "Loading..."
              : `${Number(statsData.minPrice).toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Median Price
          </p>
          <p className="text-3xl font-bold mt-2">
            {isLoading
              ? progress?.stage?.stage || "Loading..."
              : `${Number(statsData.medianPrice).toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Maximum Price
          </p>
          <p className="text-3xl font-bold mt-2">
            {isLoading
              ? progress?.stage?.stage || "Loading..."
              : `${Number(statsData.maxPrice).toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Trend Section Component
function TrendSection({ resultSet, isLoading, error, progress }: any) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-red-500">
            Error loading trend data: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Trends Over Time</CardTitle>
        <CardDescription>
          Track how retail and promotional prices change over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CubeQueryWrapper
          isLoading={isLoading}
          error={error}
          progress={progress}
        >
          {resultSet && (
            <ChartViewer
              chartId="executive-trend"
              chartType="line"
              resultSet={resultSet}
              pivotConfig={{
                x: ["prices.price_date.day"],
                y: ["measures"],
                fillMissingDates: true,
              }}
              decimals={2}
              currency="лв"
            />
          )}
        </CubeQueryWrapper>
      </CardContent>
    </Card>
  );
}

// Category Section Component
function CategorySection({ resultSet, isLoading, error, progress }: any) {
  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      category: row["category_groups.name"],
      // With castNumerics: true, this should already be a number
      price: Number(row["prices.averageRetailPrice"] || 0),
      promo: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Average Price by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-red-500">
            Error loading category data: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Retail & Promo Prices by Category</CardTitle>
        <CardDescription>
          Compare retail and promotional prices across product categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CubeQueryWrapper
          isLoading={isLoading}
          error={error}
          progress={progress}
        >
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => {
                    const label =
                      props.dataKey === "price"
                        ? "Retail Price"
                        : "Promo Price";
                    return [`${value.toFixed(2)} лв`, label];
                  }}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Bar dataKey="price" fill="#0088FE" name="Retail Price" />
                <Bar dataKey="promo" fill="#00C49F" name="Promo Price" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CubeQueryWrapper>
      </CardContent>
    </Card>
  );
}
