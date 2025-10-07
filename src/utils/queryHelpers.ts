import { GlobalFilters } from '@/pages/DashboardPage';

export function buildFilters(globalFilters: GlobalFilters) {
  const filters = [];
  
  if (globalFilters.retailers?.length > 0) {
    filters.push({
      member: "retailers.name",
      operator: "equals" as const,
      values: globalFilters.retailers,
    });
  }
  
  if (globalFilters.locations?.length > 0) {
    filters.push({
      member: "settlements.name_bg",
      operator: "equals" as const,
      values: globalFilters.locations,
    });
  }
  
  if (globalFilters.categories?.length > 0) {
    filters.push({
      member: "category_groups.name",
      operator: "equals" as const,
      values: globalFilters.categories,
    });
  }
  
  return filters;
}

export function buildTimeDimensions(dateRange?: string[]) {
  return dateRange ? [
    {
      dimension: "prices.price_date",
      dateRange: dateRange,
    }
  ] : [
    {
      dimension: "prices.price_date",
      dateRange: "Last 30 days" as const,
    }
  ];
}

export function buildTimeDimensionsWithGranularity(dateRange?: string[], granularity: string = 'day') {
  return dateRange ? [
    {
      dimension: "prices.price_date",
      granularity: granularity as const,
      dateRange: dateRange,
    }
  ] : [
    {
      dimension: "prices.price_date",
      granularity: granularity as const,
      dateRange: "Last 30 days" as const,
    }
  ];
}
