/**
 * Pre-Aggregation Test Component
 *
 * Use this to test if your queries are matching pre-aggregations
 */

import { useState } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logQueryAnalysis } from "@/utils/cube/debugPreAggregations";

const TEST_QUERIES = {
  // ========================================
  // MAIN QUERIES (Your specific ones)
  // ========================================
  main_query: {
    name: "🎯 Your Main Query (Non-Additive)",
    query: {
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
      order: { "prices.price_date": "asc" },
    },
  },
  main_query_fast: {
    name: "🚀 Your Main Query (Fast Additive)",
    query: {
      measures: ["prices.totalRetailPrice", "prices.totalPromoPrice", "prices.retailPriceCount", "prices.promoPriceCount"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
      order: { "prices.price_date": "asc" },
    },
  },

  // ========================================
  // EXECUTIVE OVERVIEW CHARTS
  // ========================================
  stats_cards: {
    name: "📊 Stats Cards",
    query: {
      measures: ["prices.minRetailPrice", "prices.maxRetailPrice"],
    },
  },
  trend_chart: {
    name: "📈 Trend Chart",
    query: {
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },
  category_chart: {
    name: "🛒 Category Chart",
    query: {
      dimensions: ["category_groups.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },

  // ========================================
  // COMPETITOR ANALYSIS CHARTS
  // ========================================
  retailer_trend_chart: {
    name: "🆚 Retailer Trend Chart",
    query: {
      dimensions: ["retailers.name"],
      measures: ["prices.averageRetailPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },
  retailer_price_chart: {
    name: "💰 Retailer Price Chart",
    query: {
      dimensions: ["retailers.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },
  discount_chart: {
    name: "🏷️ Discount Chart",
    query: {
      dimensions: ["retailers.name"],
      measures: ["prices.averageDiscountPercentage"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },

  // ========================================
  // CATEGORY DEEP DIVE CHARTS
  // ========================================
  category_trend_chart: {
    name: "📊 Category Trend Chart",
    query: {
      dimensions: ["category_groups.name"],
      measures: ["prices.averageRetailPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },
  category_range_chart: {
    name: "📏 Category Range Chart",
    query: {
      dimensions: ["category_groups.name"],
      measures: [
        "prices.averageRetailPrice",
        "prices.minRetailPrice",
        "prices.maxRetailPrice",
      ],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },

  // ========================================
  // GEOGRAPHICAL INSIGHTS CHARTS
  // ========================================
  regional_trend_chart: {
    name: "🗺️ Regional Trend Chart",
    query: {
      dimensions: ["municipality.name"],
      measures: ["prices.averageRetailPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },
  settlement_chart: {
    name: "🏘️ Settlement Chart",
    query: {
      dimensions: ["settlements.name_bg"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
      limit: 20,
    },
  },
  municipality_chart: {
    name: "🏛️ Municipality Chart",
    query: {
      dimensions: ["municipality.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
      limit: 15,
    },
  },
  settlement_horizontal: {
    name: "📊 Settlement Horizontal",
    query: {
      dimensions: ["settlements.name_bg"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
      limit: 20,
    },
  },
  municipality_horizontal: {
    name: "📈 Municipality Horizontal",
    query: {
      dimensions: ["municipality.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
      limit: 15,
    },
  },

  // ========================================
  // DASHBOARD COMPONENTS (Complex queries)
  // ========================================
  competitor_analysis_trend: {
    name: "🔍 Competitor Analysis - Trend",
    query: {
      dimensions: ["retailers.name"],
      measures: ["prices.averageRetailPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },
  competitor_analysis_avg: {
    name: "🔍 Competitor Analysis - Average",
    query: {
      dimensions: ["retailers.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },
  category_deep_dive_trend: {
    name: "🔍 Category Deep Dive - Trend",
    query: {
      dimensions: ["category_groups.name"],
      measures: ["prices.averageRetailPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },
  category_deep_dive_compare: {
    name: "🔍 Category Deep Dive - Compare",
    query: {
      dimensions: ["category_groups.name"],
      measures: [
        "prices.averageRetailPrice",
        "prices.minRetailPrice",
        "prices.maxRetailPrice",
      ],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },

  // ========================================
  // FILTERED QUERIES (Testing filter combinations)
  // ========================================
  filter_retailer_only: {
    name: "🔍 Filter: Retailer Only",
    query: {
      dimensions: ["prices.retailer_name"], // Include filtered dimension!
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [
        {
          member: "prices.retailer_name",
          operator: "equals",
          values: ["Kaufland"],
        },
      ],
    },
  },
  filter_location_only: {
    name: "🔍 Filter: Location Only",
    query: {
      dimensions: ["prices.settlement_name"], // Include filtered dimension!
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [
        {
          member: "prices.settlement_name",
          operator: "equals",
          values: ["София"],
        },
      ],
    },
  },
  filter_category_only: {
    name: "🔍 Filter: Category Only",
    query: {
      dimensions: ["prices.category_group_name"], // Include filtered dimension!
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [
        {
          member: "prices.category_group_name",
          operator: "equals",
          values: ["Месо и месни продукти"],
        },
      ],
    },
  },
  filter_retailer_category: {
    name: "🔍 Filter: Retailer + Category",
    query: {
      dimensions: ["prices.retailer_name", "prices.category_group_name"], // Include both filtered dimensions!
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [
        {
          member: "prices.retailer_name",
          operator: "equals",
          values: ["Kaufland"],
        },
        {
          member: "prices.category_group_name",
          operator: "equals",
          values: ["Месо и месни продукти"],
        },
      ],
    },
  },
  filter_all_three: {
    name: "🔍 Filter: All Three (Retailer + Location + Category)",
    query: {
      dimensions: ["prices.retailer_name", "prices.settlement_name", "prices.category_group_name"], // Include all filtered dimensions!
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [
        {
          member: "prices.retailer_name",
          operator: "equals",
          values: ["Kaufland"],
        },
        {
          member: "prices.settlement_name",
          operator: "equals",
          values: ["София"],
        },
        {
          member: "prices.category_group_name",
          operator: "equals",
          values: ["Месо и месни продукти"],
        },
      ],
    },
  },
  filter_time_only: {
    name: "🔍 Filter: Time Only (No Other Filters)",
    query: {
      dimensions: [], // No dimensions - just time filter
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 7 days", // Different time range
        },
      ],
      filters: [], // No filters
    },
  },

  // ========================================
  // TIME FILTER VARIATIONS (Testing different date ranges)
  // ========================================
  time_last_7_days: {
    name: "⏰ Time: Last 7 Days",
    query: {
      dimensions: [],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 7 days",
        },
      ],
      filters: [],
    },
  },
  time_last_30_days: {
    name: "⏰ Time: Last 30 Days",
    query: {
      dimensions: [],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [],
    },
  },
  time_last_90_days: {
    name: "⏰ Time: Last 90 Days",
    query: {
      dimensions: [],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 90 days",
        },
      ],
      filters: [],
    },
  },
  time_this_month: {
    name: "⏰ Time: This Month",
    query: {
      dimensions: [],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "This month",
        },
      ],
      filters: [],
    },
  },
  time_custom_range: {
    name: "⏰ Time: Custom Range",
    query: {
      dimensions: [],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: ["2024-10-01", "2024-10-07"],
        },
      ],
      filters: [],
    },
  },

  // ========================================
  // ALL 4 FILTERS COMBINATIONS
  // ========================================
  all_four_filters_basic: {
    name: "🎯 All 4 Filters: Basic Combination",
    query: {
      dimensions: ["prices.retailer_name", "prices.settlement_name", "prices.category_group_name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days", // Time filter
        },
      ],
      filters: [
        {
          member: "prices.retailer_name",
          operator: "equals",
          values: ["Kaufland"],
        },
        {
          member: "prices.settlement_name",
          operator: "equals",
          values: ["София"],
        },
        {
          member: "prices.category_group_name",
          operator: "equals",
          values: ["Месо и месни продукти"],
        },
      ],
    },
  },
  all_four_filters_multiple_values: {
    name: "🎯 All 4 Filters: Multiple Values",
    query: {
      dimensions: ["prices.retailer_name", "prices.settlement_name", "prices.category_group_name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 7 days", // Different time range
        },
      ],
      filters: [
        {
          member: "prices.retailer_name",
          operator: "equals",
          values: ["Kaufland", "Billa"], // Multiple retailers
        },
        {
          member: "prices.settlement_name",
          operator: "equals",
          values: ["София", "Пловдив"], // Multiple locations
        },
        {
          member: "prices.category_group_name",
          operator: "equals",
          values: ["Месо и месни продукти", "Млечни продукти"], // Multiple categories
        },
      ],
    },
  },
  all_four_filters_custom_time: {
    name: "🎯 All 4 Filters: Custom Time Range",
    query: {
      dimensions: ["prices.retailer_name", "prices.settlement_name", "prices.category_group_name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: ["2024-10-01", "2024-10-15"], // Custom time range
        },
      ],
      filters: [
        {
          member: "prices.retailer_name",
          operator: "equals",
          values: ["Lidl"],
        },
        {
          member: "prices.settlement_name",
          operator: "equals",
          values: ["Варна"],
        },
        {
          member: "prices.category_group_name",
          operator: "equals",
          values: ["Хлебни и тестени изделия"],
        },
      ],
    },
  },

  // ========================================
  // PARTIAL FILTER COMBINATIONS (3 out of 4)
  // ========================================
  three_filters_no_retailer: {
    name: "🔍 3 Filters: Location + Category + Time (No Retailer)",
    query: {
      dimensions: ["prices.settlement_name", "prices.category_group_name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [
        {
          member: "prices.settlement_name",
          operator: "equals",
          values: ["София"],
        },
        {
          member: "prices.category_group_name",
          operator: "equals",
          values: ["Месо и месни продукти"],
        },
      ],
    },
  },
  three_filters_no_location: {
    name: "🔍 3 Filters: Retailer + Category + Time (No Location)",
    query: {
      dimensions: ["prices.retailer_name", "prices.category_group_name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [
        {
          member: "prices.retailer_name",
          operator: "equals",
          values: ["Kaufland"],
        },
        {
          member: "prices.category_group_name",
          operator: "equals",
          values: ["Месо и месни продукти"],
        },
      ],
    },
  },
  three_filters_no_category: {
    name: "🔍 3 Filters: Retailer + Location + Time (No Category)",
    query: {
      dimensions: ["prices.retailer_name", "prices.settlement_name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [
        {
          member: "prices.retailer_name",
          operator: "equals",
          values: ["Kaufland"],
        },
        {
          member: "prices.settlement_name",
          operator: "equals",
          values: ["София"],
        },
      ],
    },
  },
  three_filters_no_time: {
    name: "🔍 3 Filters: Retailer + Location + Category (No Time)",
    query: {
      dimensions: ["prices.retailer_name", "prices.settlement_name", "prices.category_group_name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      // No timeDimensions - testing without time filter
      filters: [
        {
          member: "prices.retailer_name",
          operator: "equals",
          values: ["Kaufland"],
        },
        {
          member: "prices.settlement_name",
          operator: "equals",
          values: ["София"],
        },
        {
          member: "prices.category_group_name",
          operator: "equals",
          values: ["Месо и месни продукти"],
        },
      ],
    },
  },

  // ========================================
  // FILTER VALUE QUERIES (For populating dropdowns)
  // ========================================
  filter_values_retailers: {
    name: "📋 Filter Values: Retailers List (Direct)",
    query: {
      dimensions: ["retailers.name"],
      measures: [],
      // No timeDimensions - we want ALL retailers, not just recent ones
      filters: [],
      order: {
        "retailers.name": "asc",
      },
    },
  },
  filter_values_settlements: {
    name: "📋 Filter Values: Settlements List (Only with Stores)",
    query: {
      dimensions: ["stores.settlement_name"],
      measures: [],
      // No timeDimensions - we want ALL settlements that have stores
      filters: [],
      order: {
        "stores.settlement_name": "asc",
      },
    },
  },
  filter_values_municipalities: {
    name: "📋 Filter Values: Municipalities List (Only with Stores)",
    query: {
      dimensions: ["stores.municipality_name"],
      measures: [],
      // No timeDimensions - we want ALL municipalities that have stores
      filters: [],
      order: {
        "stores.municipality_name": "asc",
      },
    },
  },
  filter_municipality_only: {
    name: "🔍 Filter: Municipality Only",
    query: {
      dimensions: ["prices.municipality_name"], // Include filtered dimension!
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      filters: [
        {
          member: "prices.municipality_name",
          operator: "equals",
          values: ["София-град"],
        },
      ],
    },
  },
  filter_values_categories: {
    name: "📋 Filter Values: Categories List (Only in Stores)",
    query: {
      dimensions: ["store_categories.name"],
      measures: [],
      // No timeDimensions - we want ALL categories that are available in stores
      filters: [],
      order: {
        "store_categories.name": "asc",
      },
    },
  },
  filter_values_categories_all: {
    name: "📋 Filter Values: Categories List (All Categories)",
    query: {
      dimensions: ["category_groups.name"],
      measures: [],
      // No timeDimensions - we want ALL categories, even those not in stores
      filters: [],
      order: {
        "category_groups.name": "asc",
      },
    },
  },
  filter_values_categories_slow: {
    name: "📋 Filter Values: Categories List (Slow - via prices)",
    query: {
      dimensions: ["prices.category_group_name"],
      measures: [],
      // No timeDimensions - we want ALL categories, not just recent ones
      filters: [],
      order: {
        "prices.category_group_name": "asc",
      },
    },
  },
  filter_values_all_combined: {
    name: "📋 Filter Values: All Filter Options",
    query: {
      dimensions: [
        "prices.retailer_name",
        "prices.settlement_name", 
        "prices.category_group_name"
      ],
      measures: [],
      // No timeDimensions - we want ALL possible combinations
      filters: [],
      order: {
        "prices.retailer_name": "asc",
      },
    },
  },
};

export function PreAggregationTest() {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const testQuery = selectedTest
    ? TEST_QUERIES[selectedTest as keyof typeof TEST_QUERIES]?.query
    : null;

  const { resultSet, isLoading, error } = useCubeQuery(testQuery || {}, {
    skip: !testQuery,
  });

  const handleTest = (testKey: string) => {
    const test = TEST_QUERIES[testKey as keyof typeof TEST_QUERIES];
    console.group(`🧪 Testing: ${test.name}`);
    logQueryAnalysis(test.query, test.name);
    console.groupEnd();

    setSelectedTest(testKey);
    setStartTime(Date.now());
  };

  const executionTime = startTime && !isLoading ? Date.now() - startTime : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Pre-Aggregation Test Suite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Main Queries Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🎯 Main Queries</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(TEST_QUERIES)
                  .filter(([key]) => key.startsWith('main_'))
                  .map(([key, test]) => (
                    <Button
                      key={key}
                      variant={selectedTest === key ? "default" : "outline"}
                      onClick={() => handleTest(key)}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <div className="w-full">
                        <div className="font-semibold text-sm">{test.name}</div>
                        <div className="text-xs opacity-70 truncate">
                          {test.query.measures?.slice(0, 2).join(", ")}
                          {(test.query.measures?.length || 0) > 2 && "..."}
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>

            {/* Executive Overview Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">📊 Executive Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(TEST_QUERIES)
                  .filter(([key]) => ['stats_cards', 'trend_chart', 'category_chart'].includes(key))
                  .map(([key, test]) => (
                    <Button
                      key={key}
                      variant={selectedTest === key ? "default" : "outline"}
                      onClick={() => handleTest(key)}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <div className="w-full">
                        <div className="font-semibold text-sm">{test.name}</div>
                        <div className="text-xs opacity-70 truncate">
                          {test.query.measures?.slice(0, 2).join(", ")}
                          {(test.query.measures?.length || 0) > 2 && "..."}
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>

            {/* Competitor Analysis Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🆚 Competitor Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(TEST_QUERIES)
                  .filter(([key]) => key.includes('retailer') || key.includes('discount') || key.includes('competitor'))
                  .map(([key, test]) => (
                    <Button
                      key={key}
                      variant={selectedTest === key ? "default" : "outline"}
                      onClick={() => handleTest(key)}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <div className="w-full">
                        <div className="font-semibold text-sm">{test.name}</div>
                        <div className="text-xs opacity-70 truncate">
                          {test.query.measures?.slice(0, 2).join(", ")}
                          {(test.query.measures?.length || 0) > 2 && "..."}
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>

            {/* Category Deep Dive Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">📊 Category Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(TEST_QUERIES)
                  .filter(([key]) => key.includes('category') && !['category_chart'].includes(key))
                  .map(([key, test]) => (
                    <Button
                      key={key}
                      variant={selectedTest === key ? "default" : "outline"}
                      onClick={() => handleTest(key)}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <div className="w-full">
                        <div className="font-semibold text-sm">{test.name}</div>
                        <div className="text-xs opacity-70 truncate">
                          {test.query.measures?.slice(0, 2).join(", ")}
                          {(test.query.measures?.length || 0) > 2 && "..."}
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>

            {/* Geographical Insights Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🗺️ Geographical Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(TEST_QUERIES)
                  .filter(([key]) => key.includes('settlement') || key.includes('municipality') || key.includes('regional'))
                  .map(([key, test]) => (
                    <Button
                      key={key}
                      variant={selectedTest === key ? "default" : "outline"}
                      onClick={() => handleTest(key)}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <div className="w-full">
                        <div className="font-semibold text-sm">{test.name}</div>
                        <div className="text-xs opacity-70 truncate">
                          {test.query.measures?.slice(0, 2).join(", ")}
                          {(test.query.measures?.length || 0) > 2 && "..."}
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>

            {/* Basic Filter Testing Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🔍 Basic Filter Testing</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Test individual filter types. Key rule: <strong>filtered dimensions must be included in query dimensions!</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(TEST_QUERIES)
                  .filter(([key]) => key.startsWith('filter_') && !key.includes('all_four') && !key.includes('three_filters'))
                  .map(([key, test]) => (
                    <Button
                      key={key}
                      variant={selectedTest === key ? "default" : "outline"}
                      onClick={() => handleTest(key)}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <div className="w-full">
                        <div className="font-semibold text-sm">{test.name}</div>
                        <div className="text-xs opacity-70 truncate">
                          Filters: {test.query.filters?.length || 0} | Dims: {test.query.dimensions?.length || 0}
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>

            {/* Time Filter Testing Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">⏰ Time Filter Testing</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Test different time ranges. <strong>All should match the same pre-aggregation</strong> (same granularity = same pre-agg).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(TEST_QUERIES)
                  .filter(([key]) => key.startsWith('time_'))
                  .map(([key, test]) => (
                    <Button
                      key={key}
                      variant={selectedTest === key ? "default" : "outline"}
                      onClick={() => handleTest(key)}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <div className="w-full">
                        <div className="font-semibold text-sm">{test.name}</div>
                        <div className="text-xs opacity-70 truncate">
                          Range: {Array.isArray(test.query.timeDimensions?.[0]?.dateRange) 
                            ? test.query.timeDimensions[0].dateRange.join(' to ')
                            : test.query.timeDimensions?.[0]?.dateRange || 'N/A'}
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>

            {/* All 4 Filters Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🎯 All 4 Filters (Retailer + Location + Category + Time)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Test all filter types together. Should match <strong>universal_filtered</strong> pre-aggregation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(TEST_QUERIES)
                  .filter(([key]) => key.includes('all_four'))
                  .map(([key, test]) => (
                    <Button
                      key={key}
                      variant={selectedTest === key ? "default" : "outline"}
                      onClick={() => handleTest(key)}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <div className="w-full">
                        <div className="font-semibold text-sm">{test.name}</div>
                        <div className="text-xs opacity-70 truncate">
                          All filters active | Dims: {test.query.dimensions?.length || 0}
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>

            {/* 3 out of 4 Filters Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🔍 Partial Filter Combinations (3 out of 4)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Test combinations with one filter type missing. Should match specific combination pre-aggregations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(TEST_QUERIES)
                  .filter(([key]) => key.includes('three_filters'))
                  .map(([key, test]) => (
                    <Button
                      key={key}
                      variant={selectedTest === key ? "default" : "outline"}
                      onClick={() => handleTest(key)}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <div className="w-full">
                        <div className="font-semibold text-sm">{test.name}</div>
                        <div className="text-xs opacity-70 truncate">
                          Filters: {test.query.filters?.length || 0} | Time: {test.query.timeDimensions ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>

            {/* Filter Values Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">📋 Filter Value Queries (Dropdown Population)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Test queries that populate filter dropdowns. <strong>Critical for dashboard load performance!</strong> 
                Compare direct queries (fast) vs subqueries (slow).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(TEST_QUERIES)
                  .filter(([key]) => key.startsWith('filter_values'))
                  .map(([key, test]) => (
                    <Button
                      key={key}
                      variant={selectedTest === key ? "default" : "outline"}
                      onClick={() => handleTest(key)}
                      className={`h-auto p-3 text-left justify-start ${
                        key.includes('slow') ? 'border-red-200 hover:border-red-300' : 'border-green-200 hover:border-green-300'
                      }`}
                    >
                      <div className="w-full">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {key.includes('slow') ? '🐌' : 
                           key.includes('categories_all') ? '📚' : '🚀'}
                          {test.name}
                        </div>
                        <div className="text-xs opacity-70 truncate">
                          {key.includes('slow') ? 'Subquery (slow)' : 
                           key.includes('categories_all') ? 'All categories' : 
                           key.includes('categories') ? 'Only in stores' : 'Direct query (fast)'}
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                <div className="font-semibold text-blue-800 mb-2">💡 Performance Tip</div>
                <div className="text-blue-700">
                  <strong>Direct queries</strong> (🚀) should be &lt; 1 second. 
                  <strong>Subqueries</strong> (🐌) can take 1+ minutes. 
                  Always use direct queries for dropdown population!
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedTest && (
        <Card>
          <CardHeader>
            <CardTitle>
              📊 Test Results:{" "}
              {TEST_QUERIES[selectedTest as keyof typeof TEST_QUERIES].name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span>Status:</span>
                {isLoading && <Badge variant="secondary">Loading...</Badge>}
                {error && <Badge variant="destructive">Error</Badge>}
                {resultSet && <Badge variant="default">Success</Badge>}
              </div>

              {/* Performance */}
              {executionTime && (
                <div className="flex items-center gap-2">
                  <span>Execution Time:</span>
                  <Badge
                    variant={
                      executionTime < 500
                        ? "default"
                        : executionTime < 2000
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {executionTime}ms
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {executionTime < 500
                      ? "🚀 Likely using pre-aggregation"
                      : executionTime < 2000
                      ? "⚠️ Possibly using pre-aggregation"
                      : "🐌 Likely querying source database"}
                  </span>
                </div>
              )}

              {/* Results */}
              {resultSet && (
                <div>
                  <div className="text-sm font-medium mb-2">Data Preview:</div>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    Rows: {resultSet.tablePivot().length}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div>
                  <div className="text-sm font-medium mb-2 text-red-600">
                    Error:
                  </div>
                  <div className="bg-red-50 p-3 rounded text-sm text-red-800">
                    {error.toString()}
                  </div>
                </div>
              )}

              {/* Query Details */}
              <details className="text-sm">
                <summary className="cursor-pointer font-medium">
                  Query Details
                </summary>
                <pre className="bg-muted p-3 rounded mt-2 overflow-auto">
                  {JSON.stringify(testQuery, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 Performance Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <div className="space-y-2">
            <div>
              <strong>🚀 &lt; 500ms:</strong> Excellent - likely using
              pre-aggregations
            </div>
            <div>
              <strong>⚠️ 500ms - 2s:</strong> Good - might be using
              pre-aggregations
            </div>
            <div>
              <strong>🐌 &gt; 2s:</strong> Slow - probably querying source
              database
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">🎯 Expected Pre-Aggregation Matches</h4>
            <div className="text-xs space-y-1">
              <div><strong>Main Query:</strong> → main (non-additive) or main_fast (additive)</div>
              <div><strong>Stats Cards:</strong> → stats_cards</div>
              <div><strong>Trend Chart:</strong> → main or prices_average</div>
              <div><strong>Retailer Charts:</strong> → retailer_chart_match, price_by_retailer</div>
              <div><strong>Category Charts:</strong> → category_chart_match, price_by_category</div>
              <div><strong>Settlement Charts:</strong> → price_by_settlement, settlement_rollup</div>
              <div><strong>Municipality Charts:</strong> → price_by_municipality, municipality_rollup</div>
              
              <div className="pt-2 border-t">
                <strong>🔍 Basic Filters:</strong>
              </div>
              <div><strong>Retailer Only:</strong> → retailer_only_filtered</div>
              <div><strong>Settlement Only:</strong> → settlement_only_filtered</div>
              <div><strong>Municipality Only:</strong> → municipality_only_filtered</div>
              <div><strong>Category Only:</strong> → category_only_filtered</div>
              <div><strong>Retailer + Category:</strong> → retailer_category_filtered</div>
              <div><strong>Location + Category:</strong> → location_category_filtered</div>
              <div><strong>Retailer + Location:</strong> → retailer_location_filtered</div>
              
              <div className="pt-2 border-t">
                <strong>⏰ Time Filters:</strong>
              </div>
              <div><strong>All Time Ranges:</strong> → time_only_filtered (same pre-agg for all ranges!)</div>
              
              <div className="pt-2 border-t">
                <strong>🎯 All 4 Filters:</strong>
              </div>
              <div><strong>All Combinations:</strong> → universal_filtered</div>
              
              <div className="pt-2 border-t">
                <strong>🔍 3 out of 4 Filters:</strong>
              </div>
              <div><strong>No Retailer:</strong> → location_category_filtered</div>
              <div><strong>No Location:</strong> → retailer_category_filtered</div>
              <div><strong>No Category:</strong> → retailer_location_filtered</div>
              <div><strong>No Time:</strong> → no_time_all_filters</div>
              
              <div className="pt-2 border-t">
                <strong>📋 Filter Value Queries:</strong>
              </div>
              <div><strong>🚀 Direct Retailers:</strong> → retailer_names (stores cube)</div>
              <div><strong>🚀 Direct Settlements:</strong> → settlement_names (stores cube)</div>
              <div><strong>🚀 Direct Municipalities:</strong> → municipality_names (stores cube)</div>
              <div><strong>🚀 Categories (In Stores):</strong> → available_categories (store_categories cube)</div>
              <div><strong>🚀 Categories (All):</strong> → category_group_names (category_groups cube)</div>
              <div><strong>🐌 Via Prices:</strong> → (expensive subqueries - avoid!)</div>
            </div>
          </div>
          
          <div className="mt-4 text-muted-foreground">
            Check browser console for detailed query analysis and matching tips.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
