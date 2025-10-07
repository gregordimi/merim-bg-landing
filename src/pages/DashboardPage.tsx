/**
 * Retail Price Intelligence Hub Dashboard
 * 
 * A comprehensive BI dashboard for retail price analysis with:
 * - Global header with KPIs and filters
 * - Four analytical tabs: Executive Overview, Competitor Analysis, Category Deep Dive, Geographical Insights
 * - Dynamic filtering across all visualizations
 */

import { useState, useMemo } from "react";
import cube from "@cubejs-client/core";
import { CubeProvider } from "@cubejs-client/react";
import WebSocketTransport from "@cubejs-client/ws-transport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { extractHashConfig } from "@/utils/cube/config";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ExecutiveOverview from "@/components/dashboard/ExecutiveOverview";
import CompetitorAnalysis from "@/components/dashboard/CompetitorAnalysis";
import CategoryDeepDive from "@/components/dashboard/CategoryDeepDive";
import GeographicalInsights from "@/components/dashboard/GeographicalInsights";

interface AppConfig extends Record<string, unknown> {
  apiUrl: string;
  apiToken: string;
  useWebSockets?: boolean;
}

export interface GlobalFilters {
  retailers: string[];
  locations: string[];
  categories: string[];
  dateRange?: string[];
}

export default function DashboardPage() {
  const { apiUrl, apiToken, useWebSockets } = extractHashConfig<AppConfig>({
    apiUrl: import.meta.env.VITE_CUBE_API_URL || "",
    apiToken: import.meta.env.VITE_CUBE_API_TOKEN || "",
    useWebSockets: import.meta.env.VITE_CUBE_API_USE_WEBSOCKETS === "true",
  });

  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    retailers: [],
    locations: [],
    categories: [],
    dateRange: undefined,
  });

  // CRITICAL: Memoize the filters object to prevent unnecessary re-renders
  const stableFilters = useMemo(() => ({
    retailers: globalFilters.retailers,
    locations: globalFilters.locations,
    categories: globalFilters.categories,
    dateRange: globalFilters.dateRange,
  }), [
    globalFilters.retailers.join(','),
    globalFilters.locations.join(','), 
    globalFilters.categories.join(','),
    (globalFilters.dateRange || []).join(','),
  ]);

  const cubeApi = useMemo(() => {
    let transport = undefined;
    if (useWebSockets) {
      transport = new WebSocketTransport({ authorization: apiToken, apiUrl });
    }
    return cube(apiToken, { apiUrl, transport });
  }, [apiToken, apiUrl, useWebSockets]);

  return (
    <div className="min-h-screen bg-background">
      <CubeProvider cubeApi={cubeApi}>
        {/* Global Header with KPIs and Filters */}
        <DashboardHeader 
          globalFilters={globalFilters} 
          setGlobalFilters={setGlobalFilters} 
        />

        {/* Main Dashboard Content with Tabs */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              <TabsTrigger value="overview">
                📈 Executive Overview
              </TabsTrigger>
              <TabsTrigger value="competitor">
                🆚 Competitor Analysis
              </TabsTrigger>
              <TabsTrigger value="category">
                🛒 Category Deep Dive
              </TabsTrigger>
              <TabsTrigger value="geographical">
                🗺️ Geographical Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ExecutiveOverview globalFilters={stableFilters} />
            </TabsContent>

            <TabsContent value="competitor">
              <CompetitorAnalysis globalFilters={stableFilters} />
            </TabsContent>

            <TabsContent value="category">
              <CategoryDeepDive globalFilters={stableFilters} />
            </TabsContent>

            <TabsContent value="geographical">
              <GeographicalInsights globalFilters={stableFilters} />
            </TabsContent>
          </Tabs>
        </div>
      </CubeProvider>
    </div>
  );
}
