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
  dateRange?: [string, string];
  retailers?: string[];
  locations?: string[];
  categories?: string[];
}

export default function DashboardPage() {
  const { apiUrl, apiToken, useWebSockets } = extractHashConfig<AppConfig>({
    apiUrl: import.meta.env.VITE_CUBE_API_URL || "",
    apiToken: import.meta.env.VITE_CUBE_API_TOKEN || "",
    useWebSockets: import.meta.env.VITE_CUBE_API_USE_WEBSOCKETS === "true",
  });

  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    dateRange: undefined,
    retailers: [],
    locations: [],
    categories: [],
  });

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
              <ExecutiveOverview globalFilters={globalFilters} />
            </TabsContent>

            <TabsContent value="competitor">
              <CompetitorAnalysis globalFilters={globalFilters} />
            </TabsContent>

            <TabsContent value="category">
              <CategoryDeepDive globalFilters={globalFilters} />
            </TabsContent>

            <TabsContent value="geographical">
              <GeographicalInsights globalFilters={globalFilters} />
            </TabsContent>
          </Tabs>
        </div>
      </CubeProvider>
    </div>
  );
}
