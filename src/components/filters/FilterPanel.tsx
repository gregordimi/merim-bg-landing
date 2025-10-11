/**
 * Filter Panel Component - New version with confirmation
 * 
 * Features:
 * - Non-reactive: filters don't apply until user confirms
 * - Max selection limits to prevent overcrowded charts
 * - Default values support
 * - Visual indication of pending changes
 */

import { useState, useEffect } from 'react';
import { useCubeQuery } from '@cubejs-client/react';
import { GlobalFilters } from '@/utils/cube/filterUtils';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { FilterDialog } from '@/components/filters/FilterDialog';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface FilterPanelProps {
  globalFilters: GlobalFilters;
  onFiltersChange: (filters: GlobalFilters) => void;
}

// Configuration for max selections per filter
const MAX_SELECTIONS = {
  retailers: 5,
  settlements: 10,
  municipalities: 8,
  categories: 6,
} as const;

export function FilterPanel({ globalFilters, onFiltersChange }: FilterPanelProps) {
  // Pending filters (what user is currently selecting)
  const [pendingFilters, setPendingFilters] = useState<GlobalFilters>(globalFilters);
  
  // Track if there are pending changes
  const hasPendingChanges = JSON.stringify(pendingFilters) !== JSON.stringify(globalFilters);

  // Sync pending filters when global filters change externally
  useEffect(() => {
    setPendingFilters(globalFilters);
  }, [globalFilters]);

  // --- Data Fetching for Filters ---
  const { resultSet: retailersResult, isLoading: retailersLoading } = useCubeQuery({
    dimensions: ['stores.retailer_name'],
    order: { 'stores.retailer_name': 'asc' },
  });
  const { resultSet: settlementsResult, isLoading: settlementsLoading } = useCubeQuery({
    dimensions: ['stores.settlement_name'],
    order: { 'stores.settlement_name': 'asc' },
  });
  const { resultSet: municipalitiesResult, isLoading: municipalitiesLoading } = useCubeQuery({
    dimensions: ['stores.municipality_name'],
    order: { 'stores.municipality_name': 'asc' },
  });
  const { resultSet: categoriesResult, isLoading: categoriesLoading } = useCubeQuery({
    dimensions: ['store_categories.name'],
    order: { 'store_categories.name': 'asc' },
  });

  // --- Filter Options Extraction ---
  const retailerOptions = retailersResult
    ? retailersResult.tablePivot().map(row => ({
        value: row['stores.retailer_name'] as string,
        label: row['stores.retailer_name'] as string,
      })).filter(option => option.value)
    : [];
  const settlementOptions = settlementsResult
    ? settlementsResult.tablePivot().map(row => ({
        value: row['stores.settlement_name'] as string,
        label: row['stores.settlement_name'] as string,
      })).filter(option => option.value)
    : [];
  const municipalityOptions = municipalitiesResult
    ? municipalitiesResult.tablePivot().map(row => ({
        value: row['stores.municipality_name'] as string,
        label: row['stores.municipality_name'] as string,
      })).filter(option => option.value)
    : [];
  const categoryOptions = categoriesResult
    ? categoriesResult.tablePivot().map(row => ({
        value: row['store_categories.name'] as string,
        label: row['store_categories.name'] as string,
      })).filter(option => option.value)
    : [];

  // --- Pending Filter Update Handlers ---
  const updatePendingRetailers = (values: string[]) => {
    if (values.length <= MAX_SELECTIONS.retailers) {
      setPendingFilters({ ...pendingFilters, retailers: values });
    }
  };
  const updatePendingSettlements = (values: string[]) => {
    if (values.length <= MAX_SELECTIONS.settlements) {
      setPendingFilters({ ...pendingFilters, settlements: values });
    }
  };
  const updatePendingMunicipalities = (values: string[]) => {
    if (values.length <= MAX_SELECTIONS.municipalities) {
      setPendingFilters({ ...pendingFilters, municipalities: values });
    }
  };
  const updatePendingCategories = (values: string[]) => {
    if (values.length <= MAX_SELECTIONS.categories) {
      setPendingFilters({ ...pendingFilters, categories: values });
    }
  };

  // --- Date Range Handlers ---
  const updateDateRange = (range: string) => {
    setPendingFilters({ ...pendingFilters, dateRange: [range, range] as [string, string] });
  };

  // Relative date options
  const relativeDateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'last 3 days', label: 'Last 3 Days' },
    { value: 'last 7 days', label: 'Last 7 Days' },
    { value: 'last 30 days', label: 'Last 30 Days' },
    { value: 'last month', label: 'Last Month' },
    { value: 'last 3 months', label: 'Last 3 Months' },
    { value: 'last year', label: 'Last Year' },
  ];

  // --- Action Handlers ---
  const handleApplyFilters = () => {
    onFiltersChange(pendingFilters);
  };

  const handleReset = () => {
    setPendingFilters(globalFilters);
  };

  const handleClearAll = () => {
    const clearedFilters: GlobalFilters = {
      retailers: [],
      settlements: [],
      municipalities: [],
      categories: [],
      dateRange: ['last 7 days', 'last 7 days'] as [string, string],
    };
    setPendingFilters(clearedFilters);
  };

  const handleDateOnly = () => {
    setPendingFilters({
      retailers: [],
      settlements: [],
      municipalities: [],
      categories: [],
      dateRange: pendingFilters.dateRange,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Global Filters (Confirm to Apply)</CardTitle>
          {hasPendingChanges && (
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Pending Changes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Selectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Retailers - Dialog */}
          <div className="space-y-2">
            <Label>Retailers</Label>
            <FilterDialog
              title="Retailers"
              description="Select up to 5 retailers"
              options={retailerOptions}
              selected={pendingFilters.retailers}
              onChange={updatePendingRetailers}
              maxSelections={MAX_SELECTIONS.retailers}
              isLoading={retailersLoading}
            />
            <div className="text-xs text-muted-foreground">
              {pendingFilters.retailers.length}/{MAX_SELECTIONS.retailers} selected
              {pendingFilters.retailers.length >= MAX_SELECTIONS.retailers && (
                <span className="text-amber-600"> (max reached)</span>
              )}
            </div>
          </div>

          {/* Settlements - Dialog */}
          <div className="space-y-2">
            <Label>Settlements</Label>
            <FilterDialog
              title="Settlements"
              description="Select up to 10 settlements"
              options={settlementOptions}
              selected={pendingFilters.settlements}
              onChange={updatePendingSettlements}
              maxSelections={MAX_SELECTIONS.settlements}
              isLoading={settlementsLoading}
            />
            <div className="text-xs text-muted-foreground">
              {pendingFilters.settlements.length}/{MAX_SELECTIONS.settlements} selected
              {pendingFilters.settlements.length >= MAX_SELECTIONS.settlements && (
                <span className="text-amber-600"> (max reached)</span>
              )}
            </div>
          </div>

          {/* Municipalities - Dialog */}
          <div className="space-y-2">
            <Label>Municipalities</Label>
            <FilterDialog
              title="Municipalities"
              description="Select up to 8 municipalities"
              options={municipalityOptions}
              selected={pendingFilters.municipalities}
              onChange={updatePendingMunicipalities}
              maxSelections={MAX_SELECTIONS.municipalities}
              isLoading={municipalitiesLoading}
            />
            <div className="text-xs text-muted-foreground">
              {pendingFilters.municipalities.length}/{MAX_SELECTIONS.municipalities} selected
              {pendingFilters.municipalities.length >= MAX_SELECTIONS.municipalities && (
                <span className="text-amber-600"> (max reached)</span>
              )}
            </div>
          </div>

          {/* Categories - Keep MultiSelect */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <MultiSelect
              options={categoryOptions}
              selected={pendingFilters.categories}
              onChange={updatePendingCategories}
              placeholder={categoriesLoading ? "Loading..." : "Select categories..."}
              disabled={categoriesLoading}
            />
            <div className="text-xs text-muted-foreground">
              {pendingFilters.categories.length}/{MAX_SELECTIONS.categories} selected
              {pendingFilters.categories.length >= MAX_SELECTIONS.categories && (
                <span className="text-amber-600"> (max reached)</span>
              )}
            </div>
          </div>
        </div>

        {/* Date Range - Relative Dates */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {relativeDateOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={pendingFilters.dateRange?.[0] === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateDateRange(option.value)}
                className="w-full"
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            Selected: {pendingFilters.dateRange?.[0] || 'last 7 days'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button 
            onClick={handleApplyFilters} 
            disabled={!hasPendingChanges}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasPendingChanges}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" onClick={handleClearAll}>
            Clear All
          </Button>
          <Button variant="outline" onClick={handleDateOnly}>
            Date Only
          </Button>
        </div>

        {/* Current Filter Status */}
        <div className="border-t pt-4 space-y-2">
          <div className="text-sm font-medium">Applied Filters:</div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">
              Retailers: {globalFilters.retailers.length > 0 ? globalFilters.retailers.join(', ') : 'All'}
            </Badge>
            <Badge variant="secondary">
              Settlements: {globalFilters.settlements.length > 0 ? globalFilters.settlements.join(', ') : 'All'}
            </Badge>
            <Badge variant="secondary">
              Municipalities: {globalFilters.municipalities.length > 0 ? globalFilters.municipalities.join(', ') : 'All'}
            </Badge>
            <Badge variant="secondary">
              Categories: {globalFilters.categories.length > 0 ? globalFilters.categories.join(', ') : 'All'}
            </Badge>
            <Badge variant="secondary">
              Date: {globalFilters.dateRange ? (Array.isArray(globalFilters.dateRange) ? globalFilters.dateRange.join(' to ') : globalFilters.dateRange) : 'Last 30 days'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
