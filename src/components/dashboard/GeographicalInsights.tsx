/**
 * Geographical Insights Tab
 * 
 * A geospatial view to uncover regional pricing patterns
 */

import { useCubeQuery } from "@cubejs-client/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlobalFilters } from "@/pages/DashboardPage";
import { ChartViewer } from "@/utils/cube/ChartViewer";
import { ChartAreaSkeleton } from "@/utils/cube/components/ChartSkeleton";

interface GeographicalInsightsProps {
  globalFilters: GlobalFilters;
}

export default function GeographicalInsights({ globalFilters }: GeographicalInsightsProps) {
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
        member: "settlements.name_en",
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

  // Settlement-level pricing
  const { resultSet: settlementResult, isLoading: settlementLoading } = useCubeQuery({
    dimensions: ["settlements.name_en"],
    measures: ["prices.averageRetailPrice"],
    timeDimensions: globalFilters.dateRange
      ? [{ dimension: "prices.price_date", dateRange: globalFilters.dateRange }]
      : [],
    filters: buildFilters(),
    order: { "prices.averageRetailPrice": "desc" },
    limit: 20,
  });

  // Municipality-level pricing
  const { resultSet: municipalityResult, isLoading: municipalityLoading } = useCubeQuery({
    dimensions: ["settlements.municipality"],
    measures: ["prices.averageRetailPrice"],
    timeDimensions: globalFilters.dateRange
      ? [{ dimension: "prices.price_date", dateRange: globalFilters.dateRange }]
      : [],
    filters: buildFilters(),
    order: { "prices.averageRetailPrice": "desc" },
    limit: 15,
  });

  // Regional price trends over time
  const { resultSet: regionTrendResult, isLoading: trendLoading } = useCubeQuery({
    dimensions: ["settlements.municipality"],
    measures: ["prices.averageRetailPrice"],
    timeDimensions: globalFilters.dateRange
      ? [
          {
            dimension: "prices.price_date",
            granularity: "week" as const,
            dateRange: globalFilters.dateRange,
          },
        ]
      : [
          {
            dimension: "prices.price_date",
            granularity: "week" as const,
            dateRange: "Last 30 days" as const,
          },
        ],
    filters: buildFilters(),
    order: { "prices.price_date": "asc" },
    limit: 10,
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
          {trendLoading ? (
            <ChartAreaSkeleton />
          ) : regionTrendResult ? (
            <ChartViewer
              chartId="geo-trend"
              chartType="line"
              resultSet={regionTrendResult}
              pivotConfig={{
                x: ["prices.price_date.week"],
                y: ["stores.settlements.municipality", "measures"],
                fillMissingDates: true,
              }}
              decimals={2}
              currency="лв"
              dateFormat={{ month: "short", day: "numeric" }}
            />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Settlements by Price */}
        <Card>
          <CardHeader>
            <CardTitle>Top 20 Settlements by Average Price</CardTitle>
            <CardDescription>
              Highest average prices by settlement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settlementLoading ? (
              <ChartAreaSkeleton />
            ) : settlementResult ? (
              <ChartViewer
                chartId="geo-settlement"
                chartType="bar"
                resultSet={settlementResult}
                pivotConfig={{
                  x: ["settlements.name_en"],
                  y: ["measures"],
                  fillMissingDates: false,
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

        {/* Municipality Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Top 15 Municipalities by Average Price</CardTitle>
            <CardDescription>
              Compare average prices across municipalities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {municipalityLoading ? (
              <ChartAreaSkeleton />
            ) : municipalityResult ? (
              <ChartViewer
                chartId="geo-municipality"
                chartType="bar"
                resultSet={municipalityResult}
                pivotConfig={{
                  x: ["settlements.municipality"],
                  y: ["measures"],
                  fillMissingDates: false,
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
      </div>
    </div>
  );
}
