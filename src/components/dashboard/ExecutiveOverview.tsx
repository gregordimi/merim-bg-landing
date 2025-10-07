/**
 * Executive Overview Tab
 *
 * High-level summary of key performance indicators and market trends
 */

import { useCubeQuery } from "@cubejs-client/react";
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
  const buildFilters = () => {
    const filters = [];
    if (globalFilters.retailers && globalFilters.retailers.length > 0) {
      filters.push({
        member: "retailers.name",
        operator: "equals" as const,
        values: globalFilters.retailers,
      });
    }
    if (globalFilters.locations && globalFilters.locations.length > 0) {
      filters.push({
        member: "settlements.name_bg",
        operator: "equals" as const,
        values: globalFilters.locations,
      });
    }
    if (globalFilters.categories && globalFilters.categories.length > 0) {
      filters.push({
        member: "category_groups.name",
        operator: "equals" as const,
        values: globalFilters.categories,
      });
    }
    return filters;
  };

  const timeDimensions = globalFilters.dateRange
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

  // Price trend over time
  const { resultSet: trendResult, isLoading: trendLoading } = useCubeQuery({
    measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
    timeDimensions: timeDimensions,
    filters: buildFilters(),
    order: { "prices.price_date": "asc" },
  });

  // Price distribution by category
  const categoryTimeDimensions = globalFilters.dateRange
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
      ];

  const { resultSet: categoryResult, isLoading: categoryLoading } =
    useCubeQuery({
      dimensions: ["category_groups.name"],
      measures: ["prices.averageRetailPrice"],
      timeDimensions: categoryTimeDimensions,
      filters: buildFilters(),
      order: { "prices.averageRetailPrice": "desc" },
      limit: 20, // Limit to top 20 categories
    });

  // Min/Max/Median prices
  const { resultSet: statsResult, isLoading: statsLoading } = useCubeQuery({
    measures: [
      "prices.minRetailPrice",
      "prices.maxRetailPrice",
      "prices.medianRetailPrice",
    ],
    timeDimensions: globalFilters.dateRange
      ? [{ dimension: "prices.price_date", dateRange: globalFilters.dateRange }]
      : [],
    filters: buildFilters(),
  });

  const statsData = statsResult?.tablePivot()[0];
  const minPrice = (statsData?.["prices.minRetailPrice"] as number) || 0;
  const maxPrice = (statsData?.["prices.maxRetailPrice"] as number) || 0;
  const medianPrice = (statsData?.["prices.medianRetailPrice"] as number) || 0;

  return (
    <div className="space-y-6">
      {/* Price Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Minimum Price
            </p>
            <p className="text-3xl font-bold mt-2">
              {statsLoading ? "..." : `${Number(minPrice || 0).toFixed(2)} лв`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Median Price
            </p>
            <p className="text-3xl font-bold mt-2">
              {statsLoading
                ? "..."
                : `${Number(medianPrice || 0).toFixed(2)} лв`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Maximum Price
            </p>
            <p className="text-3xl font-bold mt-2">
              {statsLoading ? "..." : `${Number(maxPrice || 0).toFixed(2)} лв`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Price Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price Trends Over Time</CardTitle>
          <CardDescription>
            Track how retail and promotional prices change over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <ChartAreaSkeleton />
          ) : trendResult ? (
            <ChartViewer
              chartId="executive-trend"
              chartType="line"
              resultSet={trendResult}
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

      {/* Category Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Average Price by Category</CardTitle>
          <CardDescription>
            Compare average prices across product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryLoading ? (
            <ChartAreaSkeleton />
          ) : categoryResult && categoryResult.tablePivot().length > 0 ? (
            <CategoryBarChart
              data={categoryResult.tablePivot()}
              decimals={2}
              currency="лв"
            />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              {categoryResult
                ? `No data available (${
                    categoryResult.tablePivot().length
                  } rows)`
                : "No data available"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Custom component for category bar chart
function CategoryBarChart({
  data,
  decimals = 2,
  currency = "лв",
}: {
  data: any[];
  decimals?: number;
  currency?: string;
}) {
  const chartData = data.map((row) => ({
    category: row["category_groups.name"],
    price: Number(
      parseFloat(row["prices.averageRetailPrice"] || "0").toFixed(decimals)
    ),
  }));

  return (
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
        <YAxis tickFormatter={(value) => `${value} ${currency}`} />
        <Tooltip
          formatter={(value: number) => [
            `${value} ${currency}`,
            "Average Price",
          ]}
          labelStyle={{ color: "#000" }}
        />
        <Bar dataKey="price" fill="#0088FE" />
      </BarChart>
    </ResponsiveContainer>
  );
}
