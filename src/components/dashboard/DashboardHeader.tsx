/**
 * Dashboard Header Component
 * 
 * Provides:
 * - Leading KPIs (Overall Avg Retail Price, Avg Promo Price, Avg Discount %)
 * - Global Filters (Date Range, Retailer, Location, Category)
 * - Data Freshness Timestamp
 */

import { useCubeQuery } from "@cubejs-client/react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GlobalFilters } from "@/pages/DashboardPage";
import DashboardFilters from "./DashboardFilters";

interface DashboardHeaderProps {
  globalFilters: GlobalFilters;
  setGlobalFilters: (filters: GlobalFilters) => void;
}

export default function DashboardHeader({ globalFilters, setGlobalFilters }: DashboardHeaderProps) {
  // Build the query with global filters
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

  // Query for KPIs
  const { resultSet: kpiResultSet, isLoading } = useCubeQuery({
    measures: [
      "prices.averageRetailPrice",
      "prices.averagePromoPrice",
      "prices.averageDiscountPercentage",
    ],
    timeDimensions: globalFilters.dateRange
      ? [
          {
            dimension: "prices.price_date",
            dateRange: globalFilters.dateRange,
          },
        ]
      : [],
    filters: buildFilters(),
  });

  const kpiData = kpiResultSet?.tablePivot()[0];

  const avgRetailPrice = kpiData?.["prices.averageRetailPrice"] as number || 0;
  const avgPromoPrice = kpiData?.["prices.averagePromoPrice"] as number || 0;
  const avgDiscount = kpiData?.["prices.averageDiscountPercentage"] as number || 0;

  // Calculate trend (this is a simple mock - in real scenario, compare with previous period)
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const formatCurrency = (value: number) => {
    if (!value || isNaN(value)) return "0.00 лв";
    return `${Number(value).toFixed(2)} лв`;
  };

  const formatPercentage = (value: number) => {
    if (!value || isNaN(value)) return "0.0%";
    return `${Number(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Retail Price Intelligence Hub
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Overall Avg. Retail Price
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {isLoading ? "Loading..." : formatCurrency(avgRetailPrice)}
                  </p>
                </div>
                {getTrendIcon(0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Overall Avg. Promo Price
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {isLoading ? "Loading..." : formatCurrency(avgPromoPrice)}
                  </p>
                </div>
                {getTrendIcon(0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Discount %
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {isLoading ? "Loading..." : formatPercentage(avgDiscount)}
                  </p>
                </div>
                {getTrendIcon(avgDiscount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Filters */}
        <DashboardFilters 
          globalFilters={globalFilters} 
          setGlobalFilters={setGlobalFilters} 
        />
      </div>
    </div>
  );
}
