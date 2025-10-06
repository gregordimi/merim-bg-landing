/**
 * Geographical Insights Tab
 * 
 * A geospatial view to uncover regional pricing patterns
 */

import { useCubeQuery } from "@cubejs-client/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlobalFilters } from "@/pages/DashboardPage";
import IsolatedChart from "./IsolatedChart";

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

  // Settlement-level pricing - use settlements dimension directly
  const { resultSet: settlementResult, isLoading: settlementLoading } = useCubeQuery({
    dimensions: ["settlements.name_bg"],
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
          <IsolatedChart
            resultSet={regionTrendResult}
            isLoading={trendLoading}
            type="line"
            title="Regional Price Trends"
            description="Track how prices vary across different municipalities over time"
            currency="лв"
          />
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
            <IsolatedChart
              resultSet={settlementResult}
              isLoading={settlementLoading}
              type="bar"
              title="Top 20 Settlements by Average Price"
              description="Highest average prices by settlement"
              currency="лв"
            />
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
            <IsolatedChart
              resultSet={municipalityResult}
              isLoading={municipalityLoading}
              type="bar"
              title="Top 15 Municipalities by Average Price"
              description="Compare average prices across municipalities"
              currency="лв"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
