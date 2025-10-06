/**
 * Category & Product Deep Dive Tab
 * 
 * Detailed analysis of pricing within product hierarchies
 */

import { useCubeQuery } from "@cubejs-client/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlobalFilters } from "@/pages/DashboardPage";
import IsolatedChart from "./IsolatedChart";

interface CategoryDeepDiveProps {
  globalFilters: GlobalFilters;
}

export default function CategoryDeepDive({ globalFilters }: CategoryDeepDiveProps) {
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

  // Category price trends
  const { resultSet: categoryTrendResult, isLoading: trendLoading } = useCubeQuery({
    dimensions: ["category_groups.name"],
    measures: ["prices.averageRetailPrice"],
    timeDimensions: timeDimensions,
    filters: buildFilters(),
    order: { "prices.price_date": "asc" },
  });

  // Category price comparison
  const { resultSet: categoryCompareResult, isLoading: compareLoading } = useCubeQuery({
    dimensions: ["category_groups.name"],
    measures: [
      "prices.averageRetailPrice",
      "prices.minRetailPrice",
      "prices.maxRetailPrice",
    ],
    timeDimensions: globalFilters.dateRange
      ? [{ dimension: "prices.price_date", dateRange: globalFilters.dateRange }]
      : [],
    filters: buildFilters(),
    order: { "prices.averageRetailPrice": "desc" },
  });

  // Category distribution (pie chart)
  const { resultSet: categoryDistResult, isLoading: distLoading } = useCubeQuery({
    dimensions: ["category_groups.name"],
    measures: ["prices.averageRetailPrice"],
    timeDimensions: globalFilters.dateRange
      ? [{ dimension: "prices.price_date", dateRange: globalFilters.dateRange }]
      : [],
    filters: buildFilters(),
    order: { "prices.averageRetailPrice": "desc" },
    limit: 10,
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
          <IsolatedChart
            resultSet={categoryTrendResult}
            isLoading={trendLoading}
            type="line"
            title="Category Price Trends"
            description="Track how prices change across different product categories over time"
            currency="лв"
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
            <IsolatedChart
              resultSet={categoryCompareResult}
              isLoading={compareLoading}
              type="bar"
              title="Price Range by Category"
              description="Min, average, and max prices for each category"
              currency="лв"
            />
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Categories by Price</CardTitle>
            <CardDescription>
              Category distribution by average price
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IsolatedChart
              resultSet={categoryDistResult}
              isLoading={distLoading}
              type="bar"
              title="Top 10 Categories by Price"
              description="Category distribution by average price"
              currency="лв"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
