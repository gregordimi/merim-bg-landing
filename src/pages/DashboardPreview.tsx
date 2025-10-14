import React from "react";
import { CategoryTrendChart } from "@/components/charts/CategoryTrendChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { useState, useMemo } from "react";
import { GlobalFilters } from "@/utils/cube/filterUtils";
import { CubeProvider } from "@/lib/cube";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardPreview: React.FC = () => {
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    retailers: [],
    settlements: [],
    municipalities: [],
    categories: [],
    datePreset: "last7days",
    granularity: "day",
  });

  // Available categories for buttons
  const availableCategories = [
    "Лекарствени средства",
    "Месо и риба",
    "Млечни и яйца",
    "Напитки и тютюн",
    "Основни храни",
    "Пакетирани храни",
    "Плодове и зеленчуци",
    "Хигиена и козметика",
  ];

  const handleCategorySelect = (category: string) => {
    setGlobalFilters((prev) => ({
      ...prev,
      categories: [category],
    }));
  };

  const handleClearCategories = () => {
    setGlobalFilters((prev) => ({
      ...prev,
      categories: [],
    }));
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-slate-900">
              Dashboard Preview
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore price trends and category analytics with interactive
              filters
            </p>
          </div>

          {/* Category Filter Controls */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">
                Category Filters
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
                    Clear All
                  </Button>
                  {globalFilters.categories &&
                    globalFilters.categories.length > 0 && (
                      <div className="flex items-center text-sm text-slate-600">
                        Selected: {globalFilters.categories.join(", ")}
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="space-y-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">
                  Category Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CategoryTrendChart globalFilters={stableFilters} />
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">
                  Price Trends Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TrendChart globalFilters={stableFilters} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CubeProvider>
  );
};

export default DashboardPreview;
