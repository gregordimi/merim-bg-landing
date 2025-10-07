/**
 * Geographical Insights Tab
 *
 * A geospatial view to uncover regional pricing patterns
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GeographicalInsightsProps {
  globalFilters: GlobalFilters;
}

export default function GeographicalInsights({
  globalFilters,
}: GeographicalInsightsProps) {
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

  // Memoize queries to prevent unnecessary re-execution
  const settlementQuery = useMemo(
    () => ({
      dimensions: ["settlements.name_bg"],
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
      limit: 20,
    }),
    [globalFilters.dateRange, filters]
  );

  const municipalityQuery = useMemo(
    () => ({
      dimensions: ["settlements.municipality"],
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
      limit: 15,
    }),
    [globalFilters.dateRange, filters]
  );

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

  const regionTrendQuery = useMemo(
    () => ({
      dimensions: ["settlements.municipality"],
      measures: ["prices.averageRetailPrice"],
      timeDimensions: timeDimensions,
      filters: filters,
      order: { "prices.price_date": "asc" as const },
    }),
    [timeDimensions, filters]
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
    resultSet: regionTrendResult,
    isLoading: trendLoading,
    error: trendError,
    progress: trendProgress,
  } = useCubeQuery(regionTrendQuery, {
    ...queryOptions,
    skip: !isQueryPresent(regionTrendQuery),
  });

  // Only run settlement query after trend is done or has data
  const {
    resultSet: settlementResult,
    isLoading: settlementLoading,
    error: settlementError,
    progress: settlementProgress,
  } = useCubeQuery(settlementQuery, {
    ...queryOptions,
    skip:
      !isQueryPresent(settlementQuery) || (trendLoading && !regionTrendResult),
  });

  // Only run municipality query after settlement is done or has data
  const {
    resultSet: municipalityResult,
    isLoading: municipalityLoading,
    error: municipalityError,
    progress: municipalityProgress,
  } = useCubeQuery(municipalityQuery, {
    ...queryOptions,
    skip:
      !isQueryPresent(municipalityQuery) ||
      (settlementLoading && !settlementResult),
  });

  return (
    <div className="space-y-6">
      {/* Regional Price Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Price Trends</CardTitle>
          <CardDescription>
            Track how prices vary across different municipalities over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegionalTrendChart
            resultSet={regionTrendResult}
            isLoading={trendLoading}
            error={trendError}
            progress={trendProgress}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Settlements by Price */}
        <Card>
          <CardHeader>
            <CardTitle>Top 20 Settlements - Retail vs Promo</CardTitle>
            <CardDescription>
              Compare retail and promotional prices by settlement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettlementChart
              resultSet={settlementResult}
              isLoading={settlementLoading}
              error={settlementError}
              progress={settlementProgress}
            />
          </CardContent>
        </Card>

        {/* Municipality Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Top 15 Municipalities - Retail vs Promo</CardTitle>
            <CardDescription>
              Compare retail and promotional prices across municipalities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MunicipalityChart
              resultSet={municipalityResult}
              isLoading={municipalityLoading}
              error={municipalityError}
              progress={municipalityProgress}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Custom Regional Trend Chart Component
function RegionalTrendChart({ resultSet, isLoading, error, progress }: any) {
  const chartData = useMemo(() => {
    if (!resultSet) return [];

    const pivot = resultSet.tablePivot();
    console.log("Regional trend raw data:", pivot);
    console.log("Sample row:", pivot[0]);
    
    const dataMap = new Map();

    // Group data by date
    pivot.forEach((row: any) => {
      const date = row["prices.price_date.day"] || row["prices.price_date"];
      const municipality = row["settlements.municipality"];
      const price = Number(row["prices.averageRetailPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      
      const dateEntry = dataMap.get(date);
      dateEntry[municipality] = price > 0 ? price : null;
    });

    // Convert to array and sort by date
    const result = Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    console.log("Final chart data:", result);
    console.log("Number of date points:", result.length);
    return result;
  }, [resultSet]);

  // Get unique municipalities for line colors
  const municipalities = useMemo(() => {
    if (!resultSet) return [];
    const pivot = resultSet.tablePivot();
    const municipalitySet = new Set();
    pivot.forEach((row: any) => {
      if (row["settlements.municipality"]) {
        municipalitySet.add(row["settlements.municipality"]);
      }
    });
    const result = Array.from(municipalitySet);
    console.log("Municipalities found:", result);
    return result;
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
      {chartData.length > 0 && municipalities.length > 0 && (
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
            {municipalities.map((municipality, index) => (
              <Line
                key={String(municipality)}
                type="monotone"
                dataKey={String(municipality)}
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

// Custom Settlement Chart Component
function SettlementChart({ resultSet, isLoading, error, progress }: any) {
  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      settlement: row["settlements.name_bg"],
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
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="settlement"
              angle={-45}
              textAnchor="end"
              height={120}
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

// Custom Municipality Chart Component
function MunicipalityChart({ resultSet, isLoading, error, progress }: any) {
  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      municipality: row["settlements.municipality"],
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
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="municipality"
              angle={-45}
              textAnchor="end"
              height={120}
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
