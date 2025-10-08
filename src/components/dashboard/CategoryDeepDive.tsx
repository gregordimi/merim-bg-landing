/**
 * Category & Product Deep Dive Tab
 * 
 * Detailed analysis of pricing within product hierarchies
 */

import { useCubeQuery } from "@cubejs-client/react";
import { isQueryPresent } from "@cubejs-client/core";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlobalFilters } from "@/utils/cube/filterUtils";
import { ChartViewer } from "@/utils/cube/ChartViewer";
import { ChartAreaSkeleton, CubeQueryWrapper } from "@/utils/cube/components/ChartSkeleton";
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

interface CategoryDeepDiveProps {
  globalFilters: GlobalFilters;
}

export default function CategoryDeepDive({ globalFilters }: CategoryDeepDiveProps) {
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

  // Memoize queries to prevent unnecessary re-execution
  const categoryTrendQuery = useMemo(
    () => ({
      dimensions: ["category_groups.name"],
      measures: ["prices.averageRetailPrice"],
      timeDimensions: timeDimensions,
      filters: filters,
      order: { "prices.price_date": "asc" as const },
    }),
    [timeDimensions, filters]
  );

  const categoryCompareQuery = useMemo(
    () => ({
      dimensions: ["category_groups.name"],
      measures: [
        "prices.averageRetailPrice",
        "prices.minRetailPrice",
        "prices.maxRetailPrice",
      ],
      timeDimensions: globalFilters.dateRange
        ? [{ dimension: "prices.price_date", dateRange: globalFilters.dateRange }]
        : [],
      filters: filters,
      order: { "prices.averageRetailPrice": "desc" as const },
    }),
    [globalFilters.dateRange, filters]
  );

  const categoryDistQuery = useMemo(
    () => ({
      dimensions: ["category_groups.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: globalFilters.dateRange
        ? [{ dimension: "prices.price_date", dateRange: globalFilters.dateRange }]
        : [],
      filters: filters,
      order: { "prices.averageRetailPrice": "desc" as const },
      limit: 10,
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
    resultSet: categoryTrendResult,
    isLoading: trendLoading,
    error: trendError,
    progress: trendProgress,
  } = useCubeQuery(categoryTrendQuery, {
    ...queryOptions,
    skip: !isQueryPresent(categoryTrendQuery),
  });

  // Only run compare query after trend is done or has data
  const {
    resultSet: categoryCompareResult,
    isLoading: compareLoading,
    error: compareError,
    progress: compareProgress,
  } = useCubeQuery(categoryCompareQuery, {
    ...queryOptions,
    skip: !isQueryPresent(categoryCompareQuery) || (trendLoading && !categoryTrendResult),
  });

  // Only run distribution query after compare is done or has data
  const {
    resultSet: categoryDistResult,
    isLoading: distLoading,
    error: distError,
    progress: distProgress,
  } = useCubeQuery(categoryDistQuery, {
    ...queryOptions,
    skip: !isQueryPresent(categoryDistQuery) || (compareLoading && !categoryCompareResult),
  });

  return (
    <div className="space-y-6">
      {/* Category Price Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Category Price Trends</CardTitle>
          <CardDescription>
            Track how prices change across different product categories over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryTrendChart
            resultSet={categoryTrendResult}
            isLoading={trendLoading}
            error={trendError}
            progress={trendProgress}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Range by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Price Range by Category</CardTitle>
            <CardDescription>
              Min, average, and max prices for each category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryCompareChart
              resultSet={categoryCompareResult}
              isLoading={compareLoading}
              error={compareError}
              progress={compareProgress}
            />
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Categories - Retail vs Promo</CardTitle>
            <CardDescription>
              Compare retail and promotional prices for top categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDistChart
              resultSet={categoryDistResult}
              isLoading={distLoading}
              error={distError}
              progress={distProgress}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Custom Category Trend Chart Component
function CategoryTrendChart({ resultSet, isLoading, error, progress }: any) {
  const chartData = useMemo(() => {
    if (!resultSet) return [];

    const pivot = resultSet.tablePivot();
    const dataMap = new Map();

    // Group data by date
    pivot.forEach((row: any) => {
      const date = row["prices.price_date.day"] || row["prices.price_date"];
      const category = row["category_groups.name"];
      const price = Number(row["prices.averageRetailPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      
      const dateEntry = dataMap.get(date);
      dateEntry[category] = price > 0 ? price : null;
    });

    // Convert to array and sort by date
    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [resultSet]);

  // Get unique categories for line colors
  const categories = useMemo(() => {
    if (!resultSet) return [];
    const pivot = resultSet.tablePivot();
    const categorySet = new Set();
    pivot.forEach((row: any) => {
      if (row["category_groups.name"]) {
        categorySet.add(row["category_groups.name"]);
      }
    });
    return Array.from(categorySet);
  }, [resultSet]);

  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", 
    "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"
  ];

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <CubeQueryWrapper 
      isLoading={isLoading} 
      error={error} 
      progress={progress}
    >
      {chartData.length > 0 && categories.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
            />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${Number(value).toFixed(2)} лв`,
                name
              ]}
              labelFormatter={(date) => formatDate(date)}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            {categories.map((category, index) => (
              <Line
                key={String(category)}
                type="monotone"
                dataKey={String(category)}
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

// Custom Category Compare Chart Component
function CategoryCompareChart({ resultSet, isLoading, error, progress }: any) {
  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      category: row["category_groups.name"],
      average: Number(row["prices.averageRetailPrice"] || 0),
      minimum: Number(row["prices.minRetailPrice"] || 0),
      maximum: Number(row["prices.maxRetailPrice"] || 0),
    }));
  }, [resultSet]);

  return (
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
                let label = "Price";
                if (props.dataKey === "minimum") label = "Min Price";
                else if (props.dataKey === "average") label = "Avg Price";
                else if (props.dataKey === "maximum") label = "Max Price";
                return [`${value.toFixed(2)} лв`, label];
              }}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Bar dataKey="minimum" fill="#82ca9d" name="Min Price" />
            <Bar dataKey="average" fill="#0088FE" name="Avg Price" />
            <Bar dataKey="maximum" fill="#FF8042" name="Max Price" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CubeQueryWrapper>
  );
}

// Custom Category Distribution Chart Component
function CategoryDistChart({ resultSet, isLoading, error, progress }: any) {
  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      category: row["category_groups.name"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  return (
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
                const label = props.dataKey === "retailPrice" ? "Retail Price" : "Promo Price";
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
