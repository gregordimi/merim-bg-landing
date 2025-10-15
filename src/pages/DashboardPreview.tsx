import React from "react";
import { CategoryTrendChart } from "@/components/charts/CategoryTrendChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { RetailerTrendChart } from "@/components/charts/RetailerTrendChart";
import { SettlementHorizontalChart } from "@/components/charts/SettlementHorizontalChart";
import { useState, useMemo } from "react";
import { GlobalFilters } from "@/utils/cube/filterUtils";
import { CubeProvider } from "@/lib/cube";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Explorer from "@/components/charts/Explorer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { content } from "@/i18n/bg";

const DashboardPreview: React.FC = () => {
  const [currentTab, setCurrentTab] = useState("general");

  const [metricType, setMetricType] = useState<"price" | "promo" | "discount">(
    "price"
  );

  // Available categories for buttons
  const availableCategories = [
    "Основни храни",
    "Лекарствени средства",
    "Месо и риба",
    "Млечни и яйца",
    "Напитки и тютюн",
    "Пакетирани храни",
    "Плодове и зеленчуци",
    "Хигиена и козметика",
  ];

  // Available settlements
  const availableSettlements = ["София", "Пловдив", "Варна"];

  // Available retailers
  const availableRetailers = ["Лидл България", "Кауфланд България", "Минимарт"];

  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    retailers: [],
    settlements: [],
    municipalities: [],
    categories: [],
    datePreset: "last7days",
    granularity: "day",
  });

  const handleCategorySelect = (category: string) => {
    setGlobalFilters((prev) => ({
      ...prev,
      categories: [category],
    }));
  };

  const handleSelectCategories = () => {
    setGlobalFilters((prev) => ({
      ...prev,
      categories: availableCategories,
    }));
  };

  const handleSettlementSelect = (settlement: string) => {
    setGlobalFilters((prev) => ({
      ...prev,
      settlements: [settlement],
    }));
  };

  const handleSelectSettlements = () => {
    setGlobalFilters((prev) => ({
      ...prev,
      settlements: availableSettlements,
    }));
  };

  const handleRetailerSelect = (retailer: string) => {
    setGlobalFilters((prev) => ({
      ...prev,
      retailers: [retailer],
    }));
  };

  const handleSelectRetailers = () => {
    setGlobalFilters((prev) => ({
      ...prev,
      retailers: availableRetailers,
    }));
  };

  const handleTabChange = (newTab: string) => {
    // Reset all filters when switching tabs
    setGlobalFilters({
      retailers: newTab == "retailer" ? [availableRetailers[0]] : [],
      settlements: newTab == "settlement" ? [availableSettlements[0]] : [],
      municipalities: [],
      categories: newTab == "category" ? [availableCategories[0]] : [],
      datePreset: "last7days",
      granularity: "day",
    });

    // Reset metric type to default
    setMetricType("price");

    // Update current tab
    setCurrentTab(newTab);
  };

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
      globalFilters.retailers?.join(",") ?? "",
      globalFilters.settlements?.join(",") ?? "",
      globalFilters.municipalities?.join(",") ?? "",
      globalFilters.categories?.join(",") ?? "",
      globalFilters.datePreset ?? "last7days",
      globalFilters.granularity ?? "day",
    ]
  );


  const handleRegister = () => {
    console.log("Register button clicked");
  };

function RegisterButton({ children }: { children: string }) {
  // Define your click handler
  const handleRegister = () => {
    console.log("Registering...");
  };

  return (
    <Button
      size="sm"
      onClick={handleRegister}
      className="transition-all duration-200 hover:scale-105
                 relative z-0 overflow-hidden
                 p-0.5 // This creates space for the border
                 group
                 before:absolute before:inset-0 before:-z-10
                 // --- The key change is here ---
                 before:bg-[conic-gradient(from_90deg_at_50%_50%,#ff0077,#ff5a00,#ffee00,#00ff6e,#00aaff,#5f00ff,#ff0077)]
                 before:animate-[spin_2s_linear_infinite]
                 before:rounded-[inherit]
                 "
    >
      <span
        className="block h-full w-full rounded-[inherit]
                   bg-background
                   text-foreground
                   px-3 py-1 // Adjusted padding for 'sm' size
                   transition-colors group-hover:bg-accent group-hover:text-accent-foreground
                  "
      >
        {children}
      </span>
    </Button>
  );
}
  return (
    <CubeProvider>
      {/* RESPONSIVE CHANGE: Reduced padding on mobile (p-2), scales up for larger screens */}
      <div className="min-h-screen p-2 sm:p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold sm:text-4xl">
              {content.pages.dashboard.title}
            </h1>
            <p className="text-lg max-w-2xl mx-auto">
              {content.pages.dashboard.subtitle}
            </p>
          </div>

          {/* Tabs Section */}
          <Card className="shadow-lg border-0 bg-background backdrop-blur-sm">
            <Tabs
              value={currentTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              {/* RESPONSIVE CHANGE: Use a dropdown on mobile and tabs on desktop */}
              <div className="px-2 pt-2 md:hidden">
                <Select value={currentTab} onValueChange={handleTabChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      {content.pages.dashboard.tabs.general}
                    </SelectItem>
                    <SelectItem value="category">
                      {content.pages.dashboard.tabs.category}
                    </SelectItem>
                    <SelectItem value="settlement">
                      {content.pages.dashboard.tabs.settlement}
                    </SelectItem>
                    <SelectItem value="retailer">
                      {content.pages.dashboard.tabs.retailer}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TabsList className="hidden w-full grid-cols-5 md:grid">
                <TabsTrigger value="general">
                  {content.pages.dashboard.tabs.general}
                </TabsTrigger>
                <TabsTrigger value="category">
                  {content.pages.dashboard.tabs.category}
                </TabsTrigger>
                <TabsTrigger value="settlement">
                  {content.pages.dashboard.tabs.settlement}
                </TabsTrigger>
                <TabsTrigger value="retailer">
                  {content.pages.dashboard.tabs.retailer}
                </TabsTrigger>
                <TabsTrigger value="explorer">
                  explorer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explorer" className="space-y-6">
                {/* RESPONSIVE CHANGE: Reduced padding on mobile */}
                <div className="p-2 sm:p-6">
                  <Explorer globalFilters={stableFilters} />
                </div>
              </TabsContent>

              {/* General Prices Tab */}
              <TabsContent value="general" className="space-y-6">
                {/* RESPONSIVE CHANGE: Reduced padding on mobile */}
                <div className="p-2 sm:p-6">
                  <TrendChart globalFilters={stableFilters} />
                </div>
              </TabsContent>

              {/* Category Tab */}
              <TabsContent value="category" className="space-y-6">
                 {/* RESPONSIVE CHANGE: Reduced padding on mobile */}
                <div className="p-2 sm:p-6 space-y-6">
                  {/* Category Filter Controls */}
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-800">
                        {content.pages.dashboard.filters.categoryTitle}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {availableCategories.map((category) => (
                            <Button
                              key={category}
                              onClick={() => handleCategorySelect(category)}
                              variant={
                                globalFilters.categories?.includes(category)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="transition-all duration-200 hover:scale-105"
                            >
                              {category}
                            </Button>
                          ))}
                          <RegisterButton>{content.pages.dashboard.filters.addcat}</RegisterButton>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                          <Button
                            onClick={handleSelectCategories}
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900"
                          >
                            {content.pages.dashboard.filters.selectAll}
                          </Button>
                          {globalFilters.categories &&
                            globalFilters.categories.length > 0 && (
                              <div className="flex items-center text-sm text-slate-600">
                                {content.pages.dashboard.filters.selected}:{" "}
                                {globalFilters.categories.join(", ")}
                              </div>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <CategoryTrendChart globalFilters={stableFilters} />
                </div>
              </TabsContent>

              {/* Settlement Tab */}
              <TabsContent value="settlement" className="space-y-6">
                {/* RESPONSIVE CHANGE: Reduced padding on mobile */}
                <div className="p-2 sm:p-6 space-y-6">
                  {/* Settlement Filter Controls */}
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-800">
                        {content.pages.dashboard.filters.settlementTitle}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {availableSettlements.map((settlement) => (
                            <Button
                              key={settlement}
                              onClick={() => handleSettlementSelect(settlement)}
                              variant={
                                globalFilters.settlements?.includes(settlement)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="transition-all duration-200 hover:scale-105"
                            >
                              {settlement}
                            </Button>
                          ))}
                          <RegisterButton>{content.pages.dashboard.filters.addset}</RegisterButton>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                          <Button
                            onClick={handleSelectSettlements}
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900"
                          >
                            {content.pages.dashboard.filters.selectAll}
                          </Button>
                          {globalFilters.settlements &&
                            globalFilters.settlements.length > 0 && (
                              <div className="flex items-center text-sm text-slate-600">
                                {content.pages.dashboard.filters.selected}:{" "}
                                {globalFilters.settlements.join(", ")}
                              </div>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <SettlementHorizontalChart globalFilters={stableFilters} />
                </div>
              </TabsContent>

              {/* Retailer Tab */}
              <TabsContent value="retailer" className="space-y-6">
                {/* RESPONSIVE CHANGE: Reduced padding on mobile */}
                <div className="p-2 sm:p-6 space-y-6">
                  {/* Retailer Filter Controls */}
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-800">
                        {content.pages.dashboard.filters.retailerTitle}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {availableRetailers.map((retailer) => (
                            <Button
                              key={retailer}
                              onClick={() => handleRetailerSelect(retailer)}
                              variant={
                                globalFilters.retailers?.includes(retailer)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="transition-all duration-200 hover:scale-105"
                            >
                              {retailer}
                            </Button>
                          ))}
                        <RegisterButton>{content.pages.dashboard.filters.addsho}</RegisterButton>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                          <Button
                            onClick={handleSelectRetailers}
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900"
                          >
                            {content.pages.dashboard.filters.selectAll}
                          </Button>
                          {globalFilters.retailers &&
                            globalFilters.retailers.length > 0 && (
                              <div className="flex items-center text-sm text-slate-600">
                                {content.pages.dashboard.filters.selected}:{" "}
                                {globalFilters.retailers.join(", ")}
                              </div>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Metric Type Controls */}
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-800">
                        {content.pages.dashboard.metrics.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => setMetricType("price")}
                          variant={
                            metricType === "price" ? "default" : "outline"
                          }
                          size="sm"
                        >
                          {content.pages.dashboard.metrics.price}
                        </Button>
                        <Button
                          onClick={() => setMetricType("promo")}
                          variant={
                            metricType === "promo" ? "default" : "outline"
                          }
                          size="sm"
                        >
                          {content.pages.dashboard.metrics.promo}
                        </Button>
                        <Button
                          onClick={() => setMetricType("discount")}
                          variant={
                            metricType === "discount" ? "default" : "outline"
                          }
                          size="sm"
                        >
                          {content.pages.dashboard.metrics.discount}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <RetailerTrendChart
                    globalFilters={stableFilters}
                    metricType={metricType}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </CubeProvider>
  );
};

export default DashboardPreview;