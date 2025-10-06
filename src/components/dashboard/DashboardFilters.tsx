/**
 * Dashboard Filters Component
 *
 * Global filters that affect all dashboard visualizations:
 * - Date Range Selector (Last 3/7/30/90 days)
 * - Retailer Multi-Select
 * - Location Multi-Select
 * - Category Multi-Select
 */

import { useState, useEffect } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/utils/cube/components/MultiSelect";
import { X } from "lucide-react";
import { GlobalFilters } from "@/pages/DashboardPage";
import { 
  SimpleDateRangeSelector, 
  DateRangePreset, 
  getDateRangeFromPreset 
} from "./SimpleDateRangeSelector";

interface DashboardFiltersProps {
  globalFilters: GlobalFilters;
  setGlobalFilters: (filters: GlobalFilters) => void;
}

export default function DashboardFilters({
  globalFilters,
  setGlobalFilters,
}: DashboardFiltersProps) {
  // Default to Last 7 days
  const [datePreset, setDatePreset] = useState<DateRangePreset>("last7days");

  // Fetch retailers - separate simple query
  const { resultSet: retailersResult } = useCubeQuery({
    dimensions: ["retailers.name"],
    measures: [],
    order: { "retailers.name": "asc" },
  });

  // Fetch locations - query settlements that have stores
  const { resultSet: locationsResult } = useCubeQuery({
    dimensions: ["settlements.name_bg"],
    filters: [
      {
        member: "stores.settlement_ekatte",
        operator: "set",
      },
    ],
    measures: [],
    order: { "settlements.name_bg": "asc" },
  });

  // Fetch categories - separate simple query
  const { resultSet: categoriesResult } = useCubeQuery({
    dimensions: ["category_groups.name"],
    measures: [],
    order: { "category_groups.name": "asc" },
  });

  const retailers =
    retailersResult
      ?.tablePivot()
      .map((row: any) => row["retailers.name"])
      .filter(Boolean) || [];
  const locations =
    locationsResult
      ?.tablePivot()
      .map((row: any) => row["settlements.name_bg"])
      .filter(Boolean) || [];
  const categories =
    categoriesResult
      ?.tablePivot()
      .map((row: any) => row["category_groups.name"])
      .filter(Boolean) || [];

  // Update global filters when date preset changes
  useEffect(() => {
    const [start, end] = getDateRangeFromPreset(datePreset);
    setGlobalFilters({
      ...globalFilters,
      dateRange: [start, end],
    });
  }, [datePreset]);

  //  Sync local state when filters change externally (not needed for preset)
  useEffect(() => {
    if (!globalFilters.dateRange) {
      setDatePreset("last7days");
    }
  }, [globalFilters.dateRange]);

  const clearAllFilters = () => {
    setDatePreset("last7days");
    setGlobalFilters({
      dateRange: getDateRangeFromPreset("last7days"),
      retailers: [],
      locations: [],
      categories: [],
    });
  };

  const hasActiveFilters =
    (globalFilters.retailers && globalFilters.retailers.length > 0) ||
    (globalFilters.locations && globalFilters.locations.length > 0) ||
    (globalFilters.categories && globalFilters.categories.length > 0);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground">
            GLOBAL FILTERS
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Selector */}
          <div>
            <label className="text-xs font-medium mb-2 block">Date Range</label>
            <SimpleDateRangeSelector
              value={datePreset}
              onChange={setDatePreset}
            />
          </div>

          {/* Retailer Filter */}
          <div>
            <label className="text-xs font-medium mb-2 block">Retailer</label>
            <MultiSelect
              options={retailers}
              selected={globalFilters.retailers || []}
              onChange={(selected) =>
                setGlobalFilters({ ...globalFilters, retailers: selected })
              }
              placeholder="All Retailers"
              className="w-full"
            />
          </div>

          {/* Location Filter */}
          <div>
            <label className="text-xs font-medium mb-2 block">Location</label>
            <MultiSelect
              options={locations}
              selected={globalFilters.locations || []}
              onChange={(selected) =>
                setGlobalFilters({ ...globalFilters, locations: selected })
              }
              placeholder="All Locations"
              className="w-full"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium mb-2 block">Category</label>
            <MultiSelect
              options={categories}
              selected={globalFilters.categories || []}
              onChange={(selected) =>
                setGlobalFilters({ ...globalFilters, categories: selected })
              }
              placeholder="All Categories"
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
