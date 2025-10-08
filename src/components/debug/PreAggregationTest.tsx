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
