/**
 * Retail Price Intelligence Hub Dashboard
 *
 * A comprehensive BI dashboard for retail price analysis with:
 * - Global header with KPIs and filters
 * - Four analytical tabs: Executive Overview, Competitor Analysis, Category Deep Dive, Geographical Insights
 * - Dynamic filtering across all visualizations
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Uses custom tab navigation instead of shadcn Tabs to prevent mounting all tab content
 * - Only the active tab's component is rendered, preventing unnecessary queries
 * - Filter changes only trigger re-renders for the currently visible charts
 */

import { useState, useMemo } from "react";
import cube from "@cubejs-client/core";
import { CubeProvider } from "@cubejs-client/react";
import WebSocketTransport from "@cubejs-client/ws-transport";
import { extractHashConfig } from "@/utils/cube/config";
import { GlobalFilters } from "@/utils/cube/filterUtils";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { DebugNavigation } from "@/components/debug/DebugNavigation";
import ExecutiveOverview from "@/components/dashboard/ExecutiveOverview";
import CompetitorAnalysis from "@/components/dashboard/CompetitorAnalysis";
import CategoryDeepDive from "@/components/dashboard/CategoryDeepDive";
import GeographicalInsights from "@/components/dashboard/GeographicalInsights";
import { cn } from "@/lib/utils";

interface AppConfig extends Record<string, unknown> {
  apiUrl: string;
  apiToken: string;
  useWebSockets?: boolean;
}

// Tab configuration
type TabValue = 'overview' | 'competitor' | 'category' | 'geographical';

interface TabConfig {
  value: TabValue;
  label: string;
  icon: string;
  component: React.ComponentType<{ globalFilters: GlobalFilters }>;
}

const DASHBOARD_TABS: TabConfig[] = [
  {
    value: 'overview',
    label: 'Executive Overview',
    icon: '📈',
    component: ExecutiveOverview,
  },
  {
    value: 'competitor',
    label: 'Competitor Analysis',
    icon: '🆚',
    component: CompetitorAnalysis,
  },
  {
    value: 'category',
    label: 'Category Deep Dive',
    icon: '🛒',
    component: CategoryDeepDive,
  },
  {
    value: 'geographical',
    label: 'Geographical Insights',
    icon: '🗺️',
    component: GeographicalInsights,
  },
];

// GlobalFilters interface is now imported from filterUtils

export default function DashboardPage() {
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

  // Manual tab state instead of using shadcn Tabs
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  // CRITICAL: Memoize the filters object to prevent unnecessary re-renders
  const stableFilters = useMemo(
    () => ({
      retailers: globalFilters.retailers,
      settlements: globalFilters.settlements,
      municipalities: globalFilters.municipalities,
      categories: globalFilters.categories,
      dateRange: globalFilters.dateRange,
    }),
    [
      globalFilters.retailers.join(","),
      globalFilters.settlements.join(","),
      globalFilters.municipalities.join(","),
      globalFilters.categories.join(","),
      (globalFilters.dateRange || []).join(","),
    ]
  );

  const cubeApi = useMemo(() => {
    let transport = undefined;
    if (useWebSockets) {
      transport = new WebSocketTransport({ authorization: apiToken, apiUrl });
    }
    return cube(apiToken, {
      apiUrl,
      transport,
    });
  }, [apiToken, apiUrl, useWebSockets]);

  // Get the active tab component
  const activeTabConfig = DASHBOARD_TABS.find(tab => tab.value === activeTab);
  const ActiveTabComponent = activeTabConfig?.component;

  return (
    <div className="min-h-screen bg-background">
      <DebugNavigation />
      <CubeProvider cubeApi={cubeApi}>
        {/* Global Header with KPIs and Filters */}
        <DashboardHeader
          globalFilters={globalFilters}
          setGlobalFilters={setGlobalFilters}
        />

        {/* Main Dashboard Content with Custom Tab Navigation */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Custom Tab Navigation */}
          <div className="w-full mb-8">
            <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] grid grid-cols-2 lg:grid-cols-4">
              {DASHBOARD_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50",
                    activeTab === tab.value
                      ? "bg-background dark:text-foreground shadow-sm dark:border-input dark:bg-input/30"
                      : "text-foreground dark:text-muted-foreground"
                  )}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Content - Only render the selected tab */}
          <div className="flex-1 outline-none">
            {ActiveTabComponent && <ActiveTabComponent globalFilters={stableFilters} />}
          </div>
        </div>
      </CubeProvider>
    </div>
  );
}
