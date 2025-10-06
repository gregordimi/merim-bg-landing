/**
 * Competitor Analysis Tab
 * 
 * A focused view for direct comparison of retailers' pricing strategies
 */

import { useCubeQuery } from "@cubejs-client/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlobalFilters } from "@/pages/DashboardPage";
import IsolatedChart from "./IsolatedChart";

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
          <IsolatedChart
            resultSet={retailerTrendResult}
            isLoading={trendLoading}
            type="line"
            title="Retailer Price Trends"
            description="Compare how different retailers' prices change over time"
            currency="лв"
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
            <IsolatedChart
              resultSet={avgPriceResult}
              isLoading={avgLoading}
              type="bar"
              title="Average Price by Retailer"
              description="Compare retail vs promotional prices across retailers"
              currency="лв"
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
            <IsolatedChart
              resultSet={discountResult}
              isLoading={discountLoading}
              type="bar"
              title="Discount Rates by Retailer"
              description="See which retailers offer the best discounts"
              currency="%"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
