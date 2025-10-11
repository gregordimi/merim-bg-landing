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
import { cn } from "@/lib/utils";

// Import reusable chart components instead of legacy dashboard components
import { StatsCards } from "@/components/charts/StatsCards";
import { TrendChart } from "@/components/charts/TrendChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { RetailerTrendChartPrice } from "@/components/charts/RetailerTrendChartPrice";
import { RetailerTrendChartPromo } from "@/components/charts/RetailerTrendChartPromo";
import { RetailerTrendChartDiscount } from "@/components/charts/RetailerTrendChartDiscount";
import { RetailerPriceChart } from "@/components/charts/RetailerPriceChart";
import { DiscountChart } from "@/components/charts/DiscountChart";
import { CategoryTrendChart } from "@/components/charts/CategoryTrendChart";
import { CategoryRangeChart } from "@/components/charts/CategoryRangeChart";
import { RegionalTrendChart } from "@/components/charts/RegionalTrendChart";
import { SettlementHorizontalChart } from "@/components/charts/SettlementHorizontalChart";
import { MunicipalityHorizontalChart } from "@/components/charts/MunicipalityHorizontalChart";

interface AppConfig extends Record<string, unknown> {
  apiUrl: string;
  apiToken: string;
  useWebSockets?: boolean;
}

// Tab configuration - using inline components with reusable charts
type TabValue = "overview" | "competitor" | "category" | "geographical";

interface TabConfig {
  value: TabValue;
  label: string;
  icon: string;
  component: React.ComponentType<{ globalFilters: GlobalFilters }>;
}

// Executive Overview component
const ExecutiveOverview = ({ globalFilters }: { globalFilters: GlobalFilters }) => (
  <div className="space-y-6">
    <StatsCards globalFilters={globalFilters} />
    <TrendChart globalFilters={globalFilters} />
    <CategoryChart globalFilters={globalFilters} />
  </div>
);

// Competitor Analysis component
const CompetitorAnalysis = ({ globalFilters }: { globalFilters: GlobalFilters }) => (
  <div className="space-y-6">
    <RetailerTrendChartPrice globalFilters={globalFilters} />
    <RetailerTrendChartPromo globalFilters={globalFilters} />
    <RetailerTrendChartDiscount globalFilters={globalFilters} />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RetailerPriceChart globalFilters={globalFilters} />
      <DiscountChart globalFilters={globalFilters} />
    </div>
  </div>
);

// Category Deep Dive component
const CategoryDeepDive = ({ globalFilters }: { globalFilters: GlobalFilters }) => (
  <div className="space-y-6">
    <CategoryTrendChart globalFilters={globalFilters} />
    <CategoryRangeChart globalFilters={globalFilters} />
    <CategoryChart globalFilters={globalFilters} />
  </div>
);

// Geographical Insights component
const GeographicalInsights = ({ globalFilters }: { globalFilters: GlobalFilters }) => (
  <div className="space-y-6">
    <RegionalTrendChart globalFilters={globalFilters} />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SettlementHorizontalChart globalFilters={globalFilters} />
      <MunicipalityHorizontalChart globalFilters={globalFilters} />
    </div>
  </div>
);

const DASHBOARD_TABS: TabConfig[] = [
  {
    value: "overview",
    label: "Executive Overview",
    icon: "📈",
    component: ExecutiveOverview,
  },
  {
    value: "competitor",
    label: "Competitor Analysis",
    icon: "🆚",
    component: CompetitorAnalysis,
  },
  {
    value: "category",
    label: "Category Deep Dive",
    icon: "🛒",
    component: CategoryDeepDive,
  },
  {
    value: "geographical",
    label: "Geographical Insights",
    icon: "🗺️",
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
    datePreset: 'last30days',
  });

  // Manual tab state instead of using shadcn Tabs
  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  // CRITICAL: Memoize the filters object to prevent unnecessary re-renders
  const stableFilters = useMemo(
    () => ({
      retailers: globalFilters.retailers,
      settlements: globalFilters.settlements,
      municipalities: globalFilters.municipalities,
      categories: globalFilters.categories,
      datePreset: globalFilters.datePreset,
    }),
    [
      globalFilters.retailers.join(","),
      globalFilters.settlements.join(","),
      globalFilters.municipalities.join(","),
      globalFilters.categories.join(","),
      globalFilters.datePreset,
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
  const activeTabConfig = DASHBOARD_TABS.find((tab) => tab.value === activeTab);
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
            {ActiveTabComponent && (
              <ActiveTabComponent globalFilters={stableFilters} />
            )}
          </div>
        </div>
      </CubeProvider>
    </div>
  );
}
