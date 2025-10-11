/**
 * Chart Debug Page
 * 
 * Test each chart component individually to verify:
 * - Query consistency
 * - Performance improvements
 * - Pre-aggregation cache hits
 * - Filter behavior
 */

import { useState, useMemo } from "react";
import cube from "@cubejs-client/core";
import { CubeProvider } from "@cubejs-client/react";
import WebSocketTransport from "@cubejs-client/ws-transport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extractHashConfig } from "@/utils/cube/config";
import { GlobalFilters } from "@/utils/cube/filterUtils";

// Import all chart components
import { StatsCards } from "@/components/charts/StatsCards";
import { TrendChart } from "@/components/charts/TrendChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { CategoryTrendChart } from "@/components/charts/CategoryTrendChart";
import { CategoryRangeChart } from "@/components/charts/CategoryRangeChart";
import { RegionalTrendChart } from "@/components/charts/RegionalTrendChart";
import { SettlementChart } from "@/components/charts/SettlementChart";
import { MunicipalityChart } from "@/components/charts/MunicipalityChart";
import { RetailerTrendChartPrice } from "@/components/charts/RetailerTrendChartPrice";
import { RetailerTrendChartPromo } from "@/components/charts/RetailerTrendChartPromo";
import { RetailerTrendChartDiscount } from "@/components/charts/RetailerTrendChartDiscount";
import { RetailerPriceChart } from "@/components/charts/RetailerPriceChart";
import { DiscountChart } from "@/components/charts/DiscountChart";
import { DebugNavigation } from "@/components/debug/DebugNavigation";

// Simple filter controls
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AppConfig extends Record<string, unknown> {
  apiUrl: string;
  apiToken: string;
  useWebSockets?: boolean;
}

export default function ChartDebugPage() {
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
    dateRange: undefined,
  });

  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // CRITICAL: Memoize the filters object to prevent unnecessary re-renders
  const stableFilters = useMemo(() => {
    const filters = {
      retailers: globalFilters.retailers,
      settlements: globalFilters.settlements,
      municipalities: globalFilters.municipalities,
      categories: globalFilters.categories,
      dateRange: globalFilters.dateRange,
    };
    
    // Log filter changes for debugging
    const timestamp = new Date().toISOString();
    const filterInfo = `[${timestamp}] Filters updated: ${JSON.stringify(filters)}`;
    setDebugInfo(prev => [...prev.slice(-9), filterInfo]); // Keep last 10 entries
    
    return filters;
  }, [
    globalFilters.retailers.join(','),
    globalFilters.settlements.join(','),
    globalFilters.municipalities.join(','),
    globalFilters.categories.join(','),
    (globalFilters.dateRange || []).join(','),
  ]);

  const cubeApi = useMemo(() => {
    let transport = undefined;
    if (useWebSockets) {
      transport = new WebSocketTransport({ authorization: apiToken, apiUrl });
    }
    return cube(apiToken, { 
      apiUrl, 
      transport,
      // Explicitly disable debug mode
      debug: false,
    });
  }, [apiToken, apiUrl, useWebSockets]);

  // Test filter presets
  const applyTestFilters = (preset: string) => {
    switch (preset) {
      case 'empty':
        setGlobalFilters({
          retailers: [],
          settlements: [],
          municipalities: [],
          categories: [],
          dateRange: undefined,
        });
        break;
      case 'basic':
        setGlobalFilters({
          retailers: [],
          settlements: [],
          municipalities: [],
          categories: [],
          dateRange: ['2025-10-01', '2025-10-07'],
        });
        break;
      case 'filtered':
        setGlobalFilters({
          retailers: ['Kaufland'],
          settlements: ['София'],
          municipalities: [],
          categories: ['Месо и месни продукти'],
          dateRange: ['2025-10-01', '2025-10-07'],
        });
        break;
      default:
        break;
    }
  };

  const clearDebugLog = () => setDebugInfo([]);

  return (
    <div className="min-h-screen bg-background">
      <DebugNavigation />
      <CubeProvider cubeApi={cubeApi}>
        <div className="container mx-auto px-4 py-8">
          {/* Debug Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">🔧 Chart Debug Console</h1>
            <p className="text-muted-foreground mb-6">
              Test each chart component individually to verify query consistency and performance.
            </p>

            {/* Filter Controls */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Global Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <Label htmlFor="retailers">Retailers (comma-separated)</Label>
                    <Input
                      id="retailers"
                      placeholder="e.g., Kaufland, Billa"
                      value={globalFilters.retailers.join(', ')}
                      onChange={(e) => setGlobalFilters(prev => ({
                        ...prev,
                        retailers: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="settlements">Settlements (comma-separated)</Label>
                    <Input
                      id="settlements"
                      placeholder="e.g., София, Пловдив"
                      value={globalFilters.settlements.join(', ')}
                      onChange={(e) => setGlobalFilters(prev => ({
                        ...prev,
                        settlements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="municipalities">Municipalities (comma-separated)</Label>
                    <Input
                      id="municipalities"
                      placeholder="e.g., София, Пловдив"
                      value={globalFilters.municipalities.join(', ')}
                      onChange={(e) => setGlobalFilters(prev => ({
                        ...prev,
                        municipalities: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="categories">Categories (comma-separated)</Label>
                    <Input
                      id="categories"
                      placeholder="e.g., Месо и месни продукти"
                      value={globalFilters.categories.join(', ')}
                      onChange={(e) => setGlobalFilters(prev => ({
                        ...prev,
                        categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateRange">Date Range</Label>
                    <Input
                      id="dateRange"
                      placeholder="2025-10-01,2025-10-07"
                      value={(globalFilters.dateRange || []).join(',')}
                      onChange={(e) => setGlobalFilters(prev => ({
                        ...prev,
                        dateRange: e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined
                      }))}
                    />
                  </div>
                </div>

                {/* Test Presets */}
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm" onClick={() => applyTestFilters('empty')}>
                    Empty Filters
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyTestFilters('basic')}>
                    Basic (Date Only)
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyTestFilters('filtered')}>
                    Full Filters
                  </Button>
                </div>

                {/* Current Filter State */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    Retailers: {globalFilters.retailers.length || 'All'}
                  </Badge>
                  <Badge variant="secondary">
                    Settlements: {globalFilters.settlements.length || 'All'}
                  </Badge>
                  <Badge variant="secondary">
                    Municipalities: {globalFilters.municipalities.length || 'All'}
                  </Badge>
                  <Badge variant="secondary">
                    Categories: {globalFilters.categories.length || 'All'}
                  </Badge>
                  <Badge variant="secondary">
                    Date: {globalFilters.dateRange ? globalFilters.dateRange.join(' to ') : 'Last 30 days'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Debug Log */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Debug Log</CardTitle>
                <Button variant="outline" size="sm" onClick={clearDebugLog}>
                  Clear Log
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
                  {debugInfo.length === 0 ? (
                    <p className="text-muted-foreground">No debug info yet...</p>
                  ) : (
                    debugInfo.map((info, index) => (
                      <div key={index} className="mb-1">{info}</div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Tabs */}
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
              <TabsTrigger value="stats">📊 Stats</TabsTrigger>
              <TabsTrigger value="trend">📈 Trend</TabsTrigger>
              <TabsTrigger value="category">🛒 Category</TabsTrigger>
              <TabsTrigger value="retailer">🆚 Retailer</TabsTrigger>
              <TabsTrigger value="cat-trend">📊 Cat Trend</TabsTrigger>
              <TabsTrigger value="cat-range">📏 Cat Range</TabsTrigger>
              <TabsTrigger value="regional">🗺️ Regional</TabsTrigger>
              <TabsTrigger value="settlement">🏘️ Settlement</TabsTrigger>
            </TabsList>

            <TabsContent value="stats">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Stats Cards Component</h2>
                <p className="text-muted-foreground">
                  Tests: minRetailPrice, maxRetailPrice measures
                </p>
                <StatsCards globalFilters={stableFilters} />
              </div>
            </TabsContent>

            <TabsContent value="trend">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Trend Chart Component</h2>
                <p className="text-muted-foreground">
                  Tests: averageRetailPrice, averagePromoPrice with time dimensions
                </p>
                <TrendChart globalFilters={stableFilters} />
              </div>
            </TabsContent>

            <TabsContent value="category">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Category Chart Component</h2>
                <p className="text-muted-foreground">
                  Tests: category_group_name dimension with price measures
                </p>
                <CategoryChart globalFilters={stableFilters} />
              </div>
            </TabsContent>

            <TabsContent value="retailer">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Retailer Charts</h2>
                <p className="text-muted-foreground">
                  Tests: retailer_name dimension with various price trends
                </p>
                <RetailerTrendChartPrice globalFilters={stableFilters} />
                <RetailerTrendChartPromo globalFilters={stableFilters} />
                <RetailerTrendChartDiscount globalFilters={stableFilters} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RetailerPriceChart globalFilters={stableFilters} />
                  <DiscountChart globalFilters={stableFilters} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cat-trend">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Category Trend Chart</h2>
                <p className="text-muted-foreground">
                  Tests: category trends over time
                </p>
                <CategoryTrendChart globalFilters={stableFilters} />
              </div>
            </TabsContent>

            <TabsContent value="cat-range">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Category Range Chart</h2>
                <p className="text-muted-foreground">
                  Tests: min, avg, max prices by category
                </p>
                <CategoryRangeChart globalFilters={stableFilters} />
              </div>
            </TabsContent>

            <TabsContent value="regional">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Regional Trend Chart Component</h2>
                <p className="text-muted-foreground">
                  Tests: municipality_name dimension with time series
                </p>
                <RegionalTrendChart globalFilters={stableFilters} />
                <MunicipalityChart globalFilters={stableFilters} />
              </div>
            </TabsContent>

            <TabsContent value="settlement">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Settlement Chart Component</h2>
                <p className="text-muted-foreground">
                  Tests: settlement_name dimension with price comparison
                </p>
                <SettlementChart globalFilters={stableFilters} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Performance Tips */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>🚀 Performance Testing Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">What to Check:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• First load: 3-5 seconds (building pre-aggregations)</li>
                    <li>• Subsequent loads: &lt;500ms (cache hits)</li>
                    <li>• Same filters = identical queries</li>
                    <li>• No duplicate network requests</li>
                    <li>• Cube.js logs show pre-aggregation usage</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Browser Dev Tools:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Network tab: Check query consistency</li>
                    <li>• Console: Look for debug logs</li>
                    <li>• Performance tab: Measure render times</li>
                    <li>• React DevTools: Check re-renders</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CubeProvider>
    </div>
  );
}