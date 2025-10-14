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

  const handleClearCategories = () => {
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

  const handleClearSettlements = () => {
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

  const handleClearRetailers = () => {
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

  return (
    <CubeProvider>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
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
              <TabsList className="grid w-full grid-cols-4">
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
              </TabsList>

              {/* General Prices Tab */}
              <TabsContent value="general" className="space-y-6">
                <div className="p-6">
                  <TrendChart globalFilters={stableFilters} />
                </div>
              </TabsContent>

              {/* Category Tab */}
              <TabsContent value="category" className="space-y-6">
                <div className="p-6 space-y-6">
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
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            onClick={handleClearCategories}
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900"
                          >
                            {content.pages.dashboard.filters.clearAll}
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
                <div className="p-6 space-y-6">
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
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            onClick={handleClearSettlements}
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900"
                          >
                            {content.pages.dashboard.filters.clearAll}
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
                <div className="p-6 space-y-6">
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
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            onClick={handleClearRetailers}
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900"
                          >
                            {content.pages.dashboard.filters.clearAll}
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
                      <div className="flex gap-2">
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
