/**
 * Dashboard Filters Component
 * 
 * Global filters that affect all dashboard visualizations:
 * - Date Range Selector
 * - Retailer Multi-Select
 * - Location Multi-Select
 * - Category Multi-Select
 */

import { useState, useEffect } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MultiSelect } from "@/utils/cube/components/MultiSelect";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { GlobalFilters } from "@/pages/DashboardPage";

interface DashboardFiltersProps {
  globalFilters: GlobalFilters;
  setGlobalFilters: (filters: GlobalFilters) => void;
}

export default function DashboardFilters({ globalFilters, setGlobalFilters }: DashboardFiltersProps) {
  // Default to October 2025
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(2025, 9, 1), // October 1, 2025
    to: new Date(2025, 9, 31),  // October 31, 2025
  });

  // Fetch retailers - separate simple query
  const { resultSet: retailersResult } = useCubeQuery({
    dimensions: ["retailers.name"],
    measures: [],
    order: { "retailers.name": "asc" },
  });

  // Fetch locations - query settlements that have stores
  const { resultSet: locationsResult } = useCubeQuery({
    dimensions: ["stores.settlements.name_bg"],
    measures: [],
    order: { "stores.settlements.name_bg": "asc" },
  });

  // Fetch categories - separate simple query
  const { resultSet: categoriesResult } = useCubeQuery({
    dimensions: ["category_groups.name"],
    measures: [],
    order: { "category_groups.name": "asc" },
  });

  const retailers = retailersResult?.tablePivot().map((row: any) => row["retailers.name"]).filter(Boolean) || [];
  const locations = locationsResult?.tablePivot().map((row: any) => row["stores.settlements.name_bg"]).filter(Boolean) || [];
  const categories = categoriesResult?.tablePivot().map((row: any) => row["category_groups.name"]).filter(Boolean) || [];

  // Update global filters when date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      setGlobalFilters({
        ...globalFilters,
        dateRange: [
          format(dateRange.from, "yyyy-MM-dd"),
          format(dateRange.to, "yyyy-MM-dd"),
        ],
      });
    }
  }, [dateRange]);
  
  // Set default date range on mount
  useEffect(() => {
    if (dateRange.from && dateRange.to && !globalFilters.dateRange) {
      setGlobalFilters({
        ...globalFilters,
        dateRange: [
          format(dateRange.from, "yyyy-MM-dd"),
          format(dateRange.to, "yyyy-MM-dd"),
        ],
      });
    }
  }, []);

  const clearAllFilters = () => {
    setGlobalFilters({
      dateRange: undefined,
      retailers: [],
      locations: [],
      categories: [],
    });
    setDateRange({});
  };

  const hasActiveFilters = 
    globalFilters.dateRange || 
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range: any) => setDateRange(range || {})}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
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
