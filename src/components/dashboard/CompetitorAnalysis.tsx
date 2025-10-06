/**
 * Competitor Analysis Tab
 * 
 * A focused view for direct comparison of retailers' pricing strategies
 */

import { useCubeQuery } from "@cubejs-client/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlobalFilters } from "@/pages/DashboardPage";
import { ChartViewer } from "@/utils/cube/ChartViewer";
import { ChartAreaSkeleton } from "@/utils/cube/components/ChartSkeleton";

interface CompetitorAnalysisProps {
  globalFilters: GlobalFilters;
}

export default function CompetitorAnalysis({ globalFilters }: CompetitorAnalysisProps) {
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
        member: "stores.settlements.name_bg",
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

  // Retailer price comparison over time
  const { resultSet: retailerTrendResult, isLoading: trendLoading } = useCubeQuery({
    dimensions: ["retailers.name"],
    measures: ["prices.averageRetailPrice"],
    timeDimensions: timeDimensions,
    filters: buildFilters(),
    order: { "prices.price_date": "asc" },
  });

  // Average price by retailer (for bar chart)
  const { resultSet: avgPriceResult, isLoading: avgLoading } = useCubeQuery({
    dimensions: ["retailers.name"],
    measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
    timeDimensions: globalFilters.dateRange
      ? [{ dimension: "prices.price_date", dateRange: globalFilters.dateRange }]
      : [],
    filters: buildFilters(),
    order: { "prices.averageRetailPrice": "desc" },
  });

  // Discount comparison
  const { resultSet: discountResult, isLoading: discountLoading } = useCubeQuery({
    dimensions: ["retailers.name"],
    measures: ["prices.averageDiscountPercentage"],
    timeDimensions: globalFilters.dateRange
      ? [{ dimension: "prices.price_date", dateRange: globalFilters.dateRange }]
      : [],
    filters: buildFilters(),
    order: { "prices.averageDiscountPercentage": "desc" },
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
          {trendLoading ? (
            <ChartAreaSkeleton />
          ) : retailerTrendResult ? (
            <ChartViewer
              chartId="competitor-trend"
              chartType="line"
              resultSet={retailerTrendResult}
              pivotConfig={{
                x: ["prices.price_date.day"],
                y: ["retailers.name", "measures"],
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
            {avgLoading ? (
              <ChartAreaSkeleton />
            ) : avgPriceResult ? (
              <ChartViewer
                chartId="competitor-avg"
                chartType="bar"
                resultSet={avgPriceResult}
                pivotConfig={{
                  x: ["retailers.name"],
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

        <Card>
          <CardHeader>
            <CardTitle>Discount Rates by Retailer</CardTitle>
            <CardDescription>
              See which retailers offer the best discounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {discountLoading ? (
              <ChartAreaSkeleton />
            ) : discountResult ? (
              <ChartViewer
                chartId="competitor-discount"
                chartType="bar"
                resultSet={discountResult}
                pivotConfig={{
                  x: ["retailers.name"],
                  y: ["measures"],
                  fillMissingDates: false,
                }}
                decimals={1}
                currency="%"
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
