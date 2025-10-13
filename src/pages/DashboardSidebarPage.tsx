/**
 * Dashboard Sidebar Page
 *
 * New dashboard layout with:
 * - Sidebar navigation for each chart
 * - Global filters at the top
 * - Individual chart routes
 * - Card-based layout similar to ChartListPage
 */

import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import cube from "@cubejs-client/core";
import { CubeProvider } from "@cubejs-client/react";
import WebSocketTransport from "@cubejs-client/ws-transport";
import { extractHashConfig } from "@/utils/cube/config";
import { GlobalFilters } from "@/utils/cube/filterUtils";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { DebugProvider } from "@/contexts/DebugContext";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar-dashboard";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Import all chart components
import { StatsCards } from "@/components/charts/StatsCards";
import { StatsCardsTable } from "@/components/charts/StatsCardsTable";
import { TrendChart } from "@/components/charts/TrendChart";
import { StyledTrendChart } from "@/components/charts/StyledTrendChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { RegionalTrendChart } from "@/components/charts/RegionalTrendChart";
import { SettlementHorizontalChart } from "@/components/charts/SettlementHorizontalChart";
import { MunicipalityHorizontalChart } from "@/components/charts/MunicipalityHorizontalChart";
import { RetailerTrendChartPrice } from "@/components/charts/RetailerTrendChartPrice";
import { RetailerTrendChartPromo } from "@/components/charts/RetailerTrendChartPromo";
import { RetailerTrendChartDiscount } from "@/components/charts/RetailerTrendChartDiscount";
import { RetailerPriceChart } from "@/components/charts/RetailerPriceChart";
import { DiscountChart } from "@/components/charts/DiscountChart";
import { CategoryTrendChart } from "@/components/charts/CategoryTrendChart";
import { CategoryRangeChart } from "@/components/charts/CategoryRangeChart";
import { OptimizedTrendChart } from "@/components/charts/OptimizedTrendChart";
import { SimpleTrendChart } from "@/components/charts/SimpleTrendChart";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { RadarChartComponent } from "@/components/charts/RadarChartComponent";

interface AppConfig extends Record<string, unknown> {
  apiUrl: string;
  apiToken: string;
  useWebSockets?: boolean;
}

export interface ChartRoute {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name for when sidebar is collapsed
  category: string;
  component: React.ComponentType<{ globalFilters: GlobalFilters }>;
}

export const CHART_ROUTES: ChartRoute[] = [
  // Executive Overview
  {
    id: "stats",
    name: "Stats Cards",
    description: "Min and Max price statistics",
    icon: "LayoutDashboard",
    category: "Overview",
    component: StatsCards,
  },
  {
    id: "stats_table",
    name: "Stats Cards Table",
    description: "Full Stats",
    icon: "Table",
    category: "Overview",
    component: StatsCardsTable,
  },
  {
    id: "trend",
    name: "Price Trends",
    description: "Retail and promotional price trends over time",
    icon: "TrendingUp",
    category: "Overview",
    component: TrendChart,
  },
  {
    id: "trend-styled",
    name: "Styled Price Trends",
    description: "Modern styled price trends with gradients",
    icon: "LineChart",
    category: "Overview",
    component: StyledTrendChart,
  },
  {
    id: "trend-optimized",
    name: "Optimized Trends",
    description: "Fast price trends using pre-aggregations",
    icon: "Zap",
    category: "Overview",
    component: OptimizedTrendChart,
  },
  {
    id: "trend-simple",
    name: "Simple Trends",
    description: "Clean trend lines showing overall averages",
    icon: "Activity",
    category: "Overview",
    component: SimpleTrendChart,
  },
  {
    id: "category",
    name: "Category Comparison",
    description: "Price comparison across product categories",
    icon: "BarChart3",
    category: "Overview",
    component: CategoryChart,
  },
  {
    id: "pie-chart",
    name: "Category Distribution",
    description: "Pie chart showing category price distribution",
    icon: "PieChart",
    category: "Overview",
    component: PieChartComponent,
  },

  // Competitor Analysis
  {
    id: "retailer-trend-price",
    name: "Retailer Price Trends",
    description: "Compare how different retailers' prices change over time",
    icon: "Users",
    category: "Competitor",
    component: RetailerTrendChartPrice,
  },
  {
    id: "retailer-trend-promo",
    name: "Retailer Promo Trends",
    description:
      "Compare how different retailers' promo prices change over time",
    icon: "Tag",
    category: "Competitor",
    component: RetailerTrendChartPromo,
  },
  {
    id: "retailer-trend-discount",
    name: "Retailer Discount Trends",
    description: "Compare how discount rates change over time by retailer",
    icon: "Percent",
    category: "Competitor",
    component: RetailerTrendChartDiscount,
  },
  {
    id: "retailer-price",
    name: "Retailer Price Comparison",
    description: "Compare retail vs promotional prices across retailers",
    icon: "Scale",
    category: "Competitor",
    component: RetailerPriceChart,
  },
  {
    id: "discount",
    name: "Discount Rates",
    description: "Discount percentage analysis across retailers",
    icon: "BadgePercent",
    category: "Competitor",
    component: DiscountChart,
  },
  {
    id: "radar-chart",
    name: "Retailer Performance Radar",
    description: "Multi-dimensional view of retailer metrics",
    icon: "Radar",
    category: "Competitor",
    component: RadarChartComponent,
  },

  // Category Deep Dive
  {
    id: "category-trend",
    name: "Category Price Trends",
    description:
      "Track how prices change across different product categories over time",
    icon: "TrendingUp",
    category: "Category",
    component: CategoryTrendChart,
  },
  {
    id: "category-range",
    name: "Category Price Range",
    description: "Min, average, and max prices for each category",
    icon: "CandlestickChart",
    category: "Category",
    component: CategoryRangeChart,
  },

  // Geographical Insights
  {
    id: "regional",
    name: "Regional Trends",
    description: "Municipality price trends over time",
    icon: "Map",
    category: "Geographical",
    component: RegionalTrendChart,
  },
  {
    id: "settlement-horizontal",
    name: "Settlement Comparison",
    description: "Top 20 settlements with horizontal bars",
    icon: "MapPin",
    category: "Geographical",
    component: SettlementHorizontalChart,
  },
  {
    id: "municipality-horizontal",
    name: "Municipality Comparison",
    description: "Top 15 municipalities with horizontal bars",
    icon: "Building2",
    category: "Geographical",
    component: MunicipalityHorizontalChart,
  },
];

export default function DashboardSidebarPage() {
  const { chartId } = useParams<{ chartId?: string }>();
  const navigate = useNavigate();

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
    datePreset: "last7days",
    granularity: "day",
  });

  // CRITICAL: Memoize the filters object to prevent unnecessary re-renders
  const stableFilters = useMemo(
    () => ({
      retailers: globalFilters.retailers,
      settlements: globalFilters.settlements,
      municipalities: globalFilters.municipalities,
      categories: globalFilters.categories,
      datePreset: globalFilters.datePreset,
      granularity: globalFilters.granularity,
    }),
    [
      globalFilters.retailers?.join(","),
      globalFilters.settlements?.join(","),
      globalFilters.municipalities?.join(","),
      globalFilters.categories?.join(","),
      globalFilters.datePreset,
      globalFilters.granularity,
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

  // Find current chart
  const currentChart = CHART_ROUTES.find((chart) => chart.id === chartId);
  const CurrentChartComponent = currentChart?.component;

  // Default to first chart if none selected - use useEffect to avoid render-time navigation
  useEffect(() => {
    if (!chartId) {
      navigate(`/dashboard-sidebar/${CHART_ROUTES[0].id}`, { replace: true });
    }
  }, [chartId, navigate]);

  return (
    <DebugProvider>
      <CubeProvider cubeApi={cubeApi}>
        <SidebarProvider>
          <AppSidebar charts={CHART_ROUTES} currentChartId={chartId || ""} />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard-sidebar/stats">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {currentChart?.name || "Chart"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            {/* Global Filters - NEW VERSION */}
            <div className="border-b bg-muted/40 px-4 py-4">
              <FilterPanel
                globalFilters={globalFilters}
                onFiltersChange={setGlobalFilters}
              />
            </div>

            {/* OLD Filter Dropdowns - Keep for rollback
            <div className="border-b bg-muted/40 px-4 py-4">
              <FilterDropdowns
                globalFilters={globalFilters}
                onFiltersChange={setGlobalFilters}
              />
            </div>
            */}

            {/* Chart Content */}
            <div className="flex flex-1 flex-col gap-4 p-4">
              {CurrentChartComponent ? (
                <CurrentChartComponent globalFilters={stableFilters} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Chart not found</p>
                </div>
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </CubeProvider>
    </DebugProvider>
  );
}
