/**
 * Filter Dropdowns Component
 *
 * Provides optimized dropdown filters and a preset date selector.
 */

import { useState } from 'react';
import { useCubeQuery } from '@cubejs-client/react';
import { GlobalFilters } from '@/utils/cube/filterUtils';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the type for date range presets for better type safety
type DateRangePreset = 'today' | 'last3days' | 'last7days' | 'last30days' | 'last3months';

interface FilterDropdownsProps {
  globalFilters: GlobalFilters;
  onFiltersChange: (filters: GlobalFilters) => void;
}

export function FilterDropdowns({ globalFilters, onFiltersChange }: FilterDropdownsProps) {
  const [useSimpleInputs, setUseSimpleInputs] = useState(false);

  // --- Data Fetching for Filters (no changes here) ---
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

  // --- Filter Options Extraction (no changes here) ---
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

  // --- Filter Update Handlers (date handler is new) ---
  const updateRetailers = (values: string[]) => onFiltersChange({ ...globalFilters, retailers: values });
  const updateSettlements = (values: string[]) => onFiltersChange({ ...globalFilters, settlements: values });
  const updateMunicipalities = (values: string[]) => onFiltersChange({ ...globalFilters, municipalities: values });
  const updateCategories = (values: string[]) => onFiltersChange({ ...globalFilters, categories: values });

  // **NEW**: Handles date preset changes by calculating the date range
  const handleDatePresetChange = (preset: DateRangePreset) => {
    const endDate = new Date();
    const startDate = new Date();

    switch (preset) {
      case 'today':
        startDate.setDate(endDate.getDate());
        break;
      case 'last3days':
        startDate.setDate(endDate.getDate() - 3);
        break;
      case 'last7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'last30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'last3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
    }

    // Format dates to YYYY-MM-DD string
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    onFiltersChange({
      ...globalFilters,
      datePreset: preset,
      dateRange: [formatDate(startDate), formatDate(endDate)],
    });
  };

  // **UPDATED**: Test filter presets to include the new datePreset property
  const applyTestFilters = (preset: string) => {
    switch (preset) {
      case 'empty':
        onFiltersChange({
          retailers: [],
          settlements: [],
          municipalities: [],
          categories: [],
          datePreset: undefined, // Clear the preset
          dateRange: undefined,
        });
        break;
      case 'filtered':
        onFiltersChange({
          retailers: ['Kaufland'],
          settlements: ['София'],
          municipalities: ['София-град'],
          categories: ['Месо и месни продукти'],
          datePreset: 'last7days', // Set a preset
          dateRange: ['2025-10-03', '2025-10-10'], // And a corresponding range
        });
        break;
      default:
        // Set a default preset for 'Date Only' and clear others
        handleDatePresetChange('last7days');
        onFiltersChange({
          ...globalFilters,
          retailers: [],
          settlements: [],
          municipalities: [],
          categories: [],
        })
        break;
    }
  };
  
  // A map for displaying friendly names for presets in the badge
  const presetDisplayNames: Record<string, string> = {
    today: 'Today',
    last3days: 'Last 3 days',
    last7days: 'Last 7 days',
    last30days: 'Last 30 days',
    last3months: 'Last 3 months',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Filters</CardTitle>
      </CardHeader>
      <CardContent>
        {/* **UPDATED**: Layout now has 5 columns to accommodate the new date dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {!useSimpleInputs ? (
            <>
              {/* Standard Filters (no changes) */}
              <div>
                <Label htmlFor="retailers">Retailers</Label>
                <MultiSelect
                  options={retailerOptions}
                  selected={globalFilters.retailers}
                  onChange={updateRetailers}
                  placeholder={retailersLoading ? 'Loading...' : 'Select retailers...'}
                  disabled={retailersLoading}
                />
              </div>
              <div>
                <Label htmlFor="settlements">Settlements</Label>
                <MultiSelect
                  options={settlementOptions}
                  selected={globalFilters.settlements}
                  onChange={updateSettlements}
                  placeholder={settlementsLoading ? 'Loading...' : 'Select settlements...'}
                  disabled={settlementsLoading}
                />
              </div>
              <div>
                <Label htmlFor="municipalities">Municipalities</Label>
                <MultiSelect
                  options={municipalityOptions}
                  selected={globalFilters.municipalities}
                  onChange={updateMunicipalities}
                  placeholder={municipalitiesLoading ? 'Loading...' : 'Select municipalities...'}
                  disabled={municipalitiesLoading}
                />
              </div>
              <div>
                <Label htmlFor="categories">Categories</Label>
                <MultiSelect
                  options={categoryOptions}
                  selected={globalFilters.categories}
                  onChange={updateCategories}
                  placeholder={categoriesLoading ? 'Loading...' : 'Select categories...'}
                  disabled={categoriesLoading}
                />
              </div>
            </>
          ) : (
            <>
              {/* Simple Input Fallback (no changes) */}
              <div>
                <Label htmlFor="retailers">Retailers (comma-separated)</Label>
                <Input
                  id="retailers"
                  value={(globalFilters.retailers || []).join(', ')}
                  onChange={(e) => updateRetailers(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </div>
              <div>
                <Label htmlFor="settlements">Settlements (comma-separated)</Label>
                <Input
                  id="settlements"
                  value={(globalFilters.settlements || []).join(', ')}
                  onChange={(e) => updateSettlements(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </div>
              <div>
                <Label htmlFor="municipalities">Municipalities (comma-separated)</Label>
                <Input
                  id="municipalities"
                  value={(globalFilters.municipalities || []).join(', ')}
                  onChange={(e) => updateMunicipalities(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </div>
              <div>
                <Label htmlFor="categories">Categories (comma-separated)</Label>
                <Input
                  id="categories"
                  value={(globalFilters.categories || []).join(', ')}
                  onChange={(e) => updateCategories(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </div>
            </>
          )}

          {/* **NEW**: Date Range Dropdown */}
          <div>
            <Label>Date Range</Label>
            <Select
              value={globalFilters.datePreset || 'last30days'}
              onValueChange={(value: DateRangePreset) => handleDatePresetChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todat">Today</SelectItem>
                <SelectItem value="last3days">Last 3 days</SelectItem>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last3months">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Test Presets (no changes) */}
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
          <Button variant="outline" size="sm" onClick={() => setUseSimpleInputs(!useSimpleInputs)}>
            {useSimpleInputs ? 'Use Dropdowns' : 'Use Text Inputs'}
          </Button>
        </div>

        {/* **UPDATED**: Current Filter State Badge */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Retailers: {(globalFilters.retailers || []).length || 'All'}</Badge>
          <Badge variant="secondary">Settlements: {(globalFilters.settlements || []).length || 'All'}</Badge>
          <Badge variant="secondary">Municipalities: {(globalFilters.municipalities || []).length || 'All'}</Badge>
          <Badge variant="secondary">Categories: {(globalFilters.categories || []).length || 'All'}</Badge>
          <Badge variant="secondary">
            Date:{' '}
            {globalFilters.datePreset
              ? presetDisplayNames[globalFilters.datePreset]
              : (globalFilters.dateRange || []).join(' to ') || 'Not set'}
          </Badge>
        </div>

        {/* Loading Status (no changes) */}
        {(retailersLoading || settlementsLoading || municipalitiesLoading || categoriesLoading) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            Loading filter options...
          </div>
        )}
      </CardContent>
    </Card>
  );
}