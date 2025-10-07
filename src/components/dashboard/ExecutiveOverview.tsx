/**
 * Executive Overview Tab
 *
 * High-level summary of key performance indicators and market trends
 */

import { QueryRenderer } from "@cubejs-client/react";
import { useMemo, useContext } from "react";
import { CubeContext } from "@cubejs-client/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GlobalFilters } from "@/pages/DashboardPage";
import { ChartViewer } from "@/utils/cube/ChartViewer";
import { ChartAreaSkeleton } from "@/utils/cube/components/ChartSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ExecutiveOverviewProps {
  globalFilters: GlobalFilters;
}

export default function ExecutiveOverview({
  globalFilters,
}: ExecutiveOverviewProps) {
  const { cubeApi } = useContext(CubeContext);

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
      measures: ["prices.averageRetailPrice"],
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

  return (
    <div className="space-y-6">
      {/* Price Statistics Cards */}
      <QueryRenderer
        query={statsQuery}
        cubeApi={cubeApi}
        resetResultSetOnChange={false}
        render={({ resultSet, loadingState, error }) => (
          <StatsSection
            resultSet={resultSet}
            isLoading={loadingState.isLoading}
            error={error}
          />
        )}
      />

      {/* Price Trend Chart */}
      <QueryRenderer
        query={trendQuery}
        cubeApi={cubeApi}
        resetResultSetOnChange={false}
        render={({ resultSet, loadingState, error }) => (
          <TrendSection
            resultSet={resultSet}
            isLoading={loadingState.isLoading}
            error={error}
          />
        )}
      />

      {/* Category Distribution Chart */}
      <QueryRenderer
        query={categoryQuery}
        cubeApi={cubeApi}
        resetResultSetOnChange={false}
        render={({ resultSet, loadingState, error }) => (
          <CategorySection
            resultSet={resultSet}
            isLoading={loadingState.isLoading}
            error={error}
          />
        )}
      />
    </div>
  );
}

// Stats Section Component
function StatsSection({ resultSet, isLoading, error }: any) {
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
    console.log("Stats raw data:", data);

    const minPrice = data?.["prices.minRetailPrice"];
    const maxPrice = data?.["prices.maxRetailPrice"];
    const medianPrice = data?.["prices.medianRetailPrice"];

    console.log("Raw values:", { minPrice, maxPrice, medianPrice });
    console.log("Types:", {
      minType: typeof minPrice,
      maxType: typeof maxPrice,
      medianType: typeof medianPrice,
    });

    return {
      minPrice: parseFloat(minPrice) || 0,
      maxPrice: parseFloat(maxPrice) || 0,
      medianPrice: parseFloat(medianPrice) || 0,
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
            {isLoading ? "..." : `${statsData.minPrice.toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Median Price
          </p>
          <p className="text-3xl font-bold mt-2">
            {isLoading ? "..." : `${statsData.medianPrice.toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Maximum Price
          </p>
          <p className="text-3xl font-bold mt-2">
            {isLoading ? "..." : `${statsData.maxPrice.toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Trend Section Component
function TrendSection({ resultSet, isLoading, error }: any) {
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
        {isLoading ? (
          <ChartAreaSkeleton />
        ) : resultSet ? (
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
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Category Section Component
function CategorySection({ resultSet, isLoading, error }: any) {
  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      category: row["category_groups.name"],
      price: parseFloat(row["prices.averageRetailPrice"] || "0"),
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
        <CardTitle>Average Price by Category</CardTitle>
        <CardDescription>
          Compare average prices across product categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartAreaSkeleton />
        ) : chartData.length > 0 ? (
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
                formatter={(value: number) => [
                  `${value.toFixed(2)} лв`,
                  "Average Price",
                ]}
                labelStyle={{ color: "#000" }}
              />
              <Bar dataKey="price" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
