import { GlobalFilters } from '@/pages/DashboardPage';

// Cache for stable filter objects
const filterCache = new Map<string, any[]>();

export function buildFilters(globalFilters: GlobalFilters) {
  // Create a cache key from the filter values
  const cacheKey = [
    (globalFilters.retailers || []).join(','),
    (globalFilters.locations || []).join(','),
    (globalFilters.categories || []).join(',')
  ].join('|');
  
  // Return cached filters if they exist
  if (filterCache.has(cacheKey)) {
    return filterCache.get(cacheKey)!;
  }
  
  const filters = [];
  
  if (globalFilters.retailers?.length > 0) {
    filters.push({
      member: "retailers.name",
      operator: "equals" as const,
      values: [...globalFilters.retailers], // Create new array to avoid reference issues
    });
  }
  
  if (globalFilters.locations?.length > 0) {
    filters.push({
      member: "settlements.name_bg",
      operator: "equals" as const,
      values: [...globalFilters.locations],
    });
  }
  
  if (globalFilters.categories?.length > 0) {
    filters.push({
      member: "category_groups.name",
      operator: "equals" as const,
      values: [...globalFilters.categories],
    });
  }
  
  // Cache the result
  filterCache.set(cacheKey, filters);
  return filters;
}

// Cache for stable time dimension objects
const timeDimensionCache = new Map<string, any[]>();

export function buildTimeDimensions(dateRange?: string[]) {
  const cacheKey = (dateRange || []).join(',') || 'default';
  
  // Return cached time dimensions if they exist
  if (timeDimensionCache.has(cacheKey)) {
    return timeDimensionCache.get(cacheKey)!;
  }
  
  const timeDimensions = dateRange ? [
    {
      dimension: "prices.price_date",
      dateRange: [...dateRange], // Create new array to avoid reference issues
    }
  ] : [
    {
      dimension: "prices.price_date",
      dateRange: "Last 30 days" as const,
    }
  ];
  
  // Cache the result
  timeDimensionCache.set(cacheKey, timeDimensions);
  return timeDimensions;
}

// Cache for stable time dimension objects with granularity
const timeDimensionGranularityCache = new Map<string, any[]>();

export function buildTimeDimensionsWithGranularity(dateRange?: string[], granularity: string = 'day') {
  const cacheKey = `${(dateRange || []).join(',')}|${granularity}`;
  
  // Return cached time dimensions if they exist
  if (timeDimensionGranularityCache.has(cacheKey)) {
    return timeDimensionGranularityCache.get(cacheKey)!;
  }
  
  const timeDimensions = dateRange ? [
    {
      dimension: "prices.price_date",
      granularity: granularity as const,
      dateRange: [...dateRange], // Create new array to avoid reference issues
    }
  ] : [
    {
      dimension: "prices.price_date",
      granularity: granularity as const,
      dateRange: "Last 30 days" as const,
    }
  ];
  
  // Cache the result
  timeDimensionGranularityCache.set(cacheKey, timeDimensions);
  return timeDimensions;
}
