/**
 * Chart List Page
 * 
 * Simple interface with:
 * - Global filters at the top
 * - List of all available charts
 * - Click any chart to load it with current filters
 */

import { useState, useMemo } from "react";
import cube from "@cubejs-client/core";
import { CubeProvider } from "@cubejs-client/react";
import WebSocketTransport from "@cubejs-client/ws-transport";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extractHashConfig } from "@/utils/cube/config";
import { GlobalFilters, buildOptimizedQuery, QUERY_PATTERNS } from "@/utils/cube/filterUtils";
import { DebugNavigation } from "@/components/debug/DebugNavigation";
import { FilterDropdowns } from "@/components/filters/FilterDropdowns";

// Import all chart components
import { StatsCards } from "@/components/charts/StatsCards";
import { TrendChart } from "@/components/charts/TrendChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { RegionalTrendChart } from "@/components/charts/RegionalTrendChart";
import { SettlementChart } from "@/components/charts/SettlementChart";
import { MunicipalityChart } from "@/components/charts/MunicipalityChart";
import { SettlementHorizontalChart } from "@/components/charts/SettlementHorizontalChart";
import { MunicipalityHorizontalChart } from "@/components/charts/MunicipalityHorizontalChart";
import { PreAggregationTest } from "@/components/debug/PreAggregationTest";
import { RetailerTrendChartPrice } from "@/components/charts/RetailerTrendChartPrice";
import { RetailerTrendChartPromo } from "@/components/charts/RetailerTrendChartPromo";
import { RetailerPriceChart } from "@/components/charts/RetailerPriceChart";
import { DiscountChart } from "@/components/charts/DiscountChart";
import { CategoryTrendChart } from "@/components/charts/CategoryTrendChart";
import { CategoryRangeChart } from "@/components/charts/CategoryRangeChart";
import { OptimizedTrendChart } from "@/components/charts/OptimizedTrendChart";
import { SimpleTrendChart } from "@/components/charts/SimpleTrendChart";
import { MultiLineTrendChart } from "@/components/charts/MultiLineTrendChart";

interface AppConfig extends Record<string, unknown> {
  apiUrl: string;
  apiToken: string;
  useWebSockets?: boolean;
}

interface ChartInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: React.ComponentType<{ globalFilters: GlobalFilters }>;
}

const AVAILABLE_CHARTS: ChartInfo[] = [
  // Debug Tools
  {
    id: 'pre-agg-test',
    name: 'Pre-Aggregation Test',
    description: 'Test pre-aggregation matching and performance',
    icon: '🧪',
    component: () => <PreAggregationTest />,
  },
  
  // Executive Overview
  {
    id: 'stats',
    name: 'Stats Cards',
    description: 'Min and Max price statistics',
    icon: '📊',
    component: StatsCards,
  },
  {
    id: 'trend',
    name: 'Price Trends (Original)',
    description: 'Retail and promotional price trends over time',
    icon: '📈',
    component: TrendChart,
  },
  {
    id: 'trend-optimized',
    name: 'Price Trends (Optimized)',
    description: 'Fast price trends using pre-aggregations and flattened dimensions',
    icon: '🚀',
    component: OptimizedTrendChart,
  },
  {
    id: 'trend-simple',
    name: 'Price Trends (Simple)',
    description: 'Clean trend lines without dimension grouping - shows overall averages',
    icon: '📉',
    component: SimpleTrendChart,
  },
  {
    id: 'trend-multi-line',
    name: 'Price Trends (Multi-Line)',
    description: 'Separate lines for each dimension value (retailer, settlement, etc.)',
    icon: '📊',
    component: MultiLineTrendChart,
  },
  {
    id: 'category',
    name: 'Category Comparison',
    description: 'Price comparison across product categories',
    icon: '🛒',
    component: CategoryChart,
  },
  
  // Competitor Analysis
  {
    id: 'retailer-trend-price',
    name: 'Retailer Price Trends - Price',
    description: 'Compare how different retailers\' prices change over time',
    icon: '🆚',
    component: RetailerTrendChartPrice,
  },
    {
    id: 'retailer-trend-primo',
    name: 'Retailer Price Trends - Promo',
    description: 'Compare how different retailers\' promo change over time',
    icon: '🆚',
    component: RetailerTrendChartPromo,
  },
  {
    id: 'retailer-price',
    name: 'Retailer Price Comparison',
    description: 'Compare retail vs promotional prices across retailers',
    icon: '💰',
    component: RetailerPriceChart,
  },
  {
    id: 'discount',
    name: 'Discount Rates',
    description: 'See which retailers offer the best discounts',
    icon: '🏷️',
    component: DiscountChart,
  },
  
  // Category Deep Dive
  {
    id: 'category-trend',
    name: 'Category Price Trends',
    description: 'Track how prices change across different product categories over time',
    icon: '📊',
    component: CategoryTrendChart,
  },
  {
    id: 'category-range',
    name: 'Category Price Range',
    description: 'Min, average, and max prices for each category',
    icon: '📏',
    component: CategoryRangeChart,
  },
  
  // Geographical Insights
  {
    id: 'regional',
    name: 'Regional Trends',
    description: 'Municipality price trends over time',
    icon: '🗺️',
    component: RegionalTrendChart,
  },
  {
    id: 'settlement',
    name: 'Settlement Comparison',
    description: 'Top 20 settlements price comparison',
    icon: '🏘️',
    component: SettlementChart,
  },
  {
    id: 'municipality',
    name: 'Municipality Comparison',
    description: 'Top 15 municipalities price comparison',
    icon: '🏛️',
    component: MunicipalityChart,
  },
  {
    id: 'settlement-horizontal',
    name: 'Settlement Horizontal',
    description: 'Top 20 settlements with horizontal bars',
    icon: '📊',
    component: SettlementHorizontalChart,
  },
  {
    id: 'municipality-horizontal',
    name: 'Municipality Horizontal',
    description: 'Top 15 municipalities with horizontal bars',
    icon: '📈',
    component: MunicipalityHorizontalChart,
  },
];

export default function ChartListPage() {
  const { apiUrl, apiToken, useWebSockets } = extractHashConfig<AppConfig>({
    apiUrl: import.meta.env.VITE_CUBE_API_URL || "",
    apiToken: import.meta.env.VITE_CUBE_API_TOKEN || "",
    useWebSockets: import.meta.env.VITE_CUBE_API_USE_WEBSOCKETS === "true",
  });

  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    retailers: [],
    settlements: [],
    municipalities: [],
    categories: [],
    datePreset: 'last30days',
  });

  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  // CRITICAL: Memoize the filters object to prevent unnecessary re-renders
  const stableFilters = useMemo(() => ({
    retailers: globalFilters.retailers,
    settlements: globalFilters.settlements,
    municipalities: globalFilters.municipalities,
    categories: globalFilters.categories,
    datePreset: globalFilters.datePreset,
  }), [
    globalFilters.retailers.join(','),
    globalFilters.settlements.join(','),
    globalFilters.municipalities.join(','),
    globalFilters.categories.join(','),
    globalFilters.datePreset,
  ]);

  const cubeApi = useMemo(() => {
    console.log('🔧 Cube API Config:', { 
      apiUrl, 
      apiToken: apiToken ? `${apiToken.substring(0, 20)}...` : 'MISSING', 
      useWebSockets,
      env: {
        VITE_CUBE_API_URL: import.meta.env.VITE_CUBE_API_URL,
        VITE_CUBE_API_TOKEN: import.meta.env.VITE_CUBE_API_TOKEN ? 'SET' : 'MISSING'
      }
    });
    
    let transport = undefined;
    if (useWebSockets) {
      transport = new WebSocketTransport({ authorization: apiToken, apiUrl });
    }
    return cube(apiToken, { 
      apiUrl, 
      transport,
    });
  }, [apiToken, apiUrl, useWebSockets]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: GlobalFilters) => {
    setGlobalFilters(newFilters);
  };

  const selectedChartInfo = AVAILABLE_CHARTS.find(chart => chart.id === selectedChart);
  const SelectedChartComponent = selectedChartInfo?.component;

  return (
    <div className="min-h-screen bg-background">
      <DebugNavigation />
      <CubeProvider cubeApi={cubeApi}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">📋 Chart Selector</h1>
            <p className="text-muted-foreground mb-6">
              Set your filters and click any chart to load it with the current filter context.
            </p>
          </div>

          {/* Global Filters */}
          <div className="mb-8">
            <FilterDropdowns 
              globalFilters={globalFilters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Available Charts</h2>
              <div className="space-y-3">
                {AVAILABLE_CHARTS.map((chart) => (
                  <Card 
                    key={chart.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedChart === chart.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedChart(chart.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{chart.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold">{chart.name}</h3>
                          <p className="text-sm text-muted-foreground">{chart.description}</p>
                        </div>
                        {selectedChart === chart.id && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Clear Selection */}
              {selectedChart && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setSelectedChart(null)}
                >
                  Clear Selection
                </Button>
              )}
            </div>

            {/* Selected Chart Display */}
            <div>
              {selectedChart && selectedChartInfo && SelectedChartComponent ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{selectedChartInfo.icon}</span>
                    <h2 className="text-2xl font-bold">{selectedChartInfo.name}</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">{selectedChartInfo.description}</p>
                  <SelectedChartComponent globalFilters={stableFilters} />
                </div>
              ) : (
                <Card className="h-64 flex items-center justify-center">
                  <CardContent className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold mb-2">No Chart Selected</h3>
                    <p className="text-muted-foreground">
                      Click on any chart from the list to load it with your current filters.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </CubeProvider>
    </div>
  );
}