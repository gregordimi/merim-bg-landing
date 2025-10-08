/**
 * Filter Dropdowns Component
 * 
 * Provides optimized dropdown filters that populate from fast pre-aggregated queries
 */

import { useState, useEffect } from 'react';
import { useCubeQuery } from '@cubejs-client/react';
import { GlobalFilters, FILTER_VALUE_QUERIES, extractDirectFilterValues } from '@/utils/cube/filterUtils';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';

interface FilterDropdownsProps {
  globalFilters: GlobalFilters;
  onFiltersChange: (filters: GlobalFilters) => void;
}

export function FilterDropdowns({ globalFilters, onFiltersChange }: FilterDropdownsProps) {
  const [useSimpleInputs, setUseSimpleInputs] = useState(false);
  // Fetch retailers using direct query (fast)
  const { resultSet: retailersResult, isLoading: retailersLoading } = useCubeQuery({
    dimensions: ["stores.retailer_name"],
    measures: [],
    filters: [],
    order: { "stores.retailer_name": "asc" },
  });

  // Fetch settlements using direct query (fast)
  const { resultSet: settlementsResult, isLoading: settlementsLoading } = useCubeQuery({
    dimensions: ["stores.settlement_name"],
    measures: [],
    filters: [],
    order: { "stores.settlement_name": "asc" },
  });

  // Fetch municipalities using direct query (fast)
  const { resultSet: municipalitiesResult, isLoading: municipalitiesLoading } = useCubeQuery({
    dimensions: ["stores.municipality_name"],
    measures: [],
    filters: [],
    order: { "stores.municipality_name": "asc" },
  });

  // Fetch categories using direct query (fast)
  const { resultSet: categoriesResult, isLoading: categoriesLoading } = useCubeQuery({
    dimensions: ["store_categories.name"],
    measures: [],
    filters: [],
    order: { "store_categories.name": "asc" },
  });

  // Extract filter options
  const retailerOptions = retailersResult 
    ? retailersResult.tablePivot().map(row => ({
        value: row["stores.retailer_name"] as string,
        label: row["stores.retailer_name"] as string,
      })).filter(option => option.value)
    : [];

  const settlementOptions = settlementsResult 
    ? settlementsResult.tablePivot().map(row => ({
        value: row["stores.settlement_name"] as string,
        label: row["stores.settlement_name"] as string,
      })).filter(option => option.value)
    : [];

  const municipalityOptions = municipalitiesResult 
    ? municipalitiesResult.tablePivot().map(row => ({
        value: row["stores.municipality_name"] as string,
        label: row["stores.municipality_name"] as string,
      })).filter(option => option.value)
    : [];

  const categoryOptions = categoriesResult 
    ? categoriesResult.tablePivot().map(row => ({
        value: row["store_categories.name"] as string,
        label: row["store_categories.name"] as string,
      })).filter(option => option.value)
    : [];

  // Update filter handlers
  const updateRetailers = (values: string[]) => {
    onFiltersChange({
      ...globalFilters,
      retailers: values,
    });
  };

  const updateSettlements = (values: string[]) => {
    onFiltersChange({
      ...globalFilters,
      settlements: values,
    });
  };

  const updateMunicipalities = (values: string[]) => {
    onFiltersChange({
      ...globalFilters,
      municipalities: values,
    });
  };

  const updateCategories = (values: string[]) => {
    onFiltersChange({
      ...globalFilters,
      categories: values,
    });
  };

  const updateDateRange = (dateRange: string[]) => {
    onFiltersChange({
      ...globalFilters,
      dateRange: dateRange.length > 0 ? dateRange : undefined,
    });
  };

  // Test filter presets
  const applyTestFilters = (preset: string) => {
    switch (preset) {
      case 'empty':
        onFiltersChange({
          retailers: [],
          settlements: [],
          municipalities: [],
          categories: [],
          dateRange: undefined,
        });
        break;
      case 'basic':
        onFiltersChange({
          retailers: [],
          settlements: [],
          municipalities: [],
          categories: [],
          dateRange: ['2025-10-01', '2025-10-07'],
        });
        break;
      case 'filtered':
        onFiltersChange({
          retailers: ['Kaufland'],
          settlements: ['София'],
          municipalities: ['София-град'],
          categories: ['Месо и месни продукти'],
          dateRange: ['2025-10-01', '2025-10-07'],
        });
        break;
      default:
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {!useSimpleInputs ? (
            <>
              {/* Retailers Filter */}
              <div>
                <Label htmlFor="retailers">Retailers</Label>
                <MultiSelect
                  options={retailerOptions}
                  selected={globalFilters.retailers}
                  onChange={updateRetailers}
                  placeholder={retailersLoading ? "Loading..." : "Select retailers..."}
                  disabled={retailersLoading}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {retailerOptions.length} available
                </div>
              </div>

              {/* Settlements Filter */}
              <div>
                <Label htmlFor="settlements">Settlements</Label>
                <MultiSelect
                  options={settlementOptions}
                  selected={globalFilters.settlements}
                  onChange={updateSettlements}
                  placeholder={settlementsLoading ? "Loading..." : "Select settlements..."}
                  disabled={settlementsLoading}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {settlementOptions.length} available
                </div>
              </div>

              {/* Municipalities Filter */}
              <div>
                <Label htmlFor="municipalities">Municipalities</Label>
                <MultiSelect
                  options={municipalityOptions}
                  selected={globalFilters.municipalities}
                  onChange={updateMunicipalities}
                  placeholder={municipalitiesLoading ? "Loading..." : "Select municipalities..."}
                  disabled={municipalitiesLoading}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {municipalityOptions.length} available
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <Label htmlFor="categories">Categories</Label>
                <MultiSelect
                  options={categoryOptions}
                  selected={globalFilters.categories}
                  onChange={updateCategories}
                  placeholder={categoriesLoading ? "Loading..." : "Select categories..."}
                  disabled={categoriesLoading}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {categoryOptions.length} available
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Simple Input Fallback */}
              <div>
                <Label htmlFor="retailers">Retailers (comma-separated)</Label>
                <Input
                  id="retailers"
                  placeholder="e.g., Kaufland, Billa"
                  value={globalFilters.retailers.join(', ')}
                  onChange={(e) => updateRetailers(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {retailerOptions.length} available
                </div>
              </div>

              <div>
                <Label htmlFor="settlements">Settlements (comma-separated)</Label>
                <Input
                  id="settlements"
                  placeholder="e.g., София, Пловдив"
                  value={globalFilters.settlements.join(', ')}
                  onChange={(e) => updateSettlements(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {settlementOptions.length} available
                </div>
              </div>

              <div>
                <Label htmlFor="municipalities">Municipalities (comma-separated)</Label>
                <Input
                  id="municipalities"
                  placeholder="e.g., София-град, Пловдив"
                  value={globalFilters.municipalities.join(', ')}
                  onChange={(e) => updateMunicipalities(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {municipalityOptions.length} available
                </div>
              </div>

              <div>
                <Label htmlFor="categories">Categories (comma-separated)</Label>
                <Input
                  id="categories"
                  placeholder="e.g., Месо и месни продукти"
                  value={globalFilters.categories.join(', ')}
                  onChange={(e) => updateCategories(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {categoryOptions.length} available
                </div>
              </div>
            </>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="mb-4">
          <Label htmlFor="dateRange">Date Range</Label>
          <div className="flex gap-2 mt-1">
            <input
              type="date"
              value={globalFilters.dateRange?.[0] || ''}
              onChange={(e) => {
                const newRange = [e.target.value, globalFilters.dateRange?.[1] || ''].filter(Boolean);
                updateDateRange(newRange);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <input
              type="date"
              value={globalFilters.dateRange?.[1] || ''}
              onChange={(e) => {
                const newRange = [globalFilters.dateRange?.[0] || '', e.target.value].filter(Boolean);
                updateDateRange(newRange);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Test Presets */}
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => applyTestFilters('empty')}>
            Clear All
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyTestFilters('basic')}>
            Date Only
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyTestFilters('filtered')}>
            Sample Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setUseSimpleInputs(!useSimpleInputs)}
          >
            {useSimpleInputs ? 'Use Dropdowns' : 'Use Text Inputs'}
          </Button>
        </div>

        {/* Current Filter State */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            Retailers: {globalFilters.retailers.length || 'All'}
          </Badge>
          <Badge variant="secondary">
            Settlements: {globalFilters.settlements.length || 'All'}
          </Badge>
          <Badge variant="secondary">
            Municipalities: {globalFilters.municipalities.length || 'All'}
          </Badge>
          <Badge variant="secondary">
            Categories: {globalFilters.categories.length || 'All'}
          </Badge>
          <Badge variant="secondary">
            Date: {globalFilters.dateRange ? globalFilters.dateRange.join(' to ') : 'Last 30 days'}
          </Badge>
        </div>

        {/* Loading Status */}
        {(retailersLoading || settlementsLoading || municipalitiesLoading || categoriesLoading) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
            <div className="font-semibold text-blue-800 mb-1">Loading Filter Options...</div>
            <div className="text-blue-700 text-xs">
              Using fast pre-aggregated queries for optimal performance
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}