/**
 * Filter utilities for building queries that match pre-aggregations
 */

import { Query } from "@cubejs-client/core";

export interface GlobalFilters {
  retailers: string[];
  settlements: string[];
  municipalities: string[];
  categories: string[];
  dateRange?: string[];
}

/**
 * Build Cube.js filters array from GlobalFilters
 */
export function buildFilters(globalFilters: GlobalFilters) {
  const filters = [];

  // Retailer filters
  if (globalFilters.retailers?.length > 0) {
    filters.push({
      member: "prices.retailer_name",
      operator: "equals" as const,
      values: globalFilters.retailers,
    });
  }

  // Settlement filters
  if (globalFilters.settlements?.length > 0) {
    filters.push({
      member: "prices.settlement_name",
      operator: "equals" as const,
      values: globalFilters.settlements,
    });
  }

  // Municipality filters
  if (globalFilters.municipalities?.length > 0) {
    filters.push({
      member: "prices.municipality_name",
      operator: "equals" as const,
      values: globalFilters.municipalities,
    });
  }

  // Category filters
  if (globalFilters.categories?.length > 0) {
    filters.push({
      member: "prices.category_group_name",
      operator: "equals" as const,
      values: globalFilters.categories,
    });
  }

  return filters;
}

/**
 * Build time dimensions with consistent granularity
 */
export function buildTimeDimensions(dateRange?: string[]) {
  return [
    {
      dimension: "prices.price_date",
      granularity: "day" as const, // Always use 'day' for consistency
      dateRange: dateRange || "Last 30 days",
    },
  ];
}

/**
 * Build dimensions array that includes ALL filtered dimensions
 * This is CRITICAL for pre-aggregation matching!
 */
export function buildDimensions(globalFilters: GlobalFilters): string[] {
  const dimensions = [];

  // Include dimension for each active filter
  if (globalFilters.retailers?.length > 0) {
    dimensions.push("prices.retailer_name");
  }

  if (globalFilters.settlements?.length > 0) {
    dimensions.push("prices.settlement_name");
  }

  if (globalFilters.municipalities?.length > 0) {
    dimensions.push("prices.municipality_name");
  }

  if (globalFilters.categories?.length > 0) {
    dimensions.push("prices.category_group_name");
  }

  return dimensions;
}

/**
 * Build a complete query that will match pre-aggregations
 * NOTE: Don't include a dimension if it's already being filtered
 */
export function buildOptimizedQuery(
  measures: string[],
  globalFilters: GlobalFilters,
  additionalDimensions: string[] = []
): Query {
  const filteredDimensions = buildDimensions(globalFilters);
  
  // Only add additional dimensions if they're not already filtered
  const finalDimensions = [
    ...filteredDimensions,
    ...additionalDimensions.filter(dim => {
      // Don't include category dimension if categories are filtered
      if (dim === "prices.category_group_name" && globalFilters.categories?.length > 0) {
        return false;
      }
      // Don't include retailer dimension if retailers are filtered
      if (dim === "prices.retailer_name" && globalFilters.retailers?.length > 0) {
        return false;
      }
      // Don't include settlement dimension if settlements are filtered
      if (dim === "prices.settlement_name" && globalFilters.settlements?.length > 0) {
        return false;
      }
      // Don't include municipality dimension if municipalities are filtered
      if (dim === "prices.municipality_name" && globalFilters.municipalities?.length > 0) {
        return false;
      }
      // If not filtered, include this dimension
      return !filteredDimensions.includes(dim);
    }),
  ];

  return {
    measures,
    dimensions: [...new Set(finalDimensions)], // Remove duplicates
    timeDimensions: buildTimeDimensions(globalFilters.dateRange),
    filters: buildFilters(globalFilters),
    order: {
      "prices.price_date": "asc",
    },
  };
}

/**
 * Predict which pre-aggregation should match a query
 */
export function predictPreAggregationMatch(
  globalFilters: GlobalFilters
): string {
  const hasRetailer = globalFilters.retailers?.length > 0;
  const hasSettlement = globalFilters.settlements?.length > 0;
  const hasMunicipality = globalFilters.municipalities?.length > 0;
  const hasCategory = globalFilters.categories?.length > 0;

  // Count active filters
  const filterCount = [hasRetailer, hasSettlement, hasMunicipality, hasCategory].filter(
    Boolean
  ).length;

  if (filterCount === 0) {
    return "time_only_filtered";
  } else if (filterCount === 1) {
    if (hasRetailer) return "retailer_only_filtered";
    if (hasSettlement) return "settlement_only_filtered";
    if (hasMunicipality) return "municipality_only_filtered";
    if (hasCategory) return "category_only_filtered";
  } else if (filterCount >= 2) {
    return "universal_filtered"; // Use universal for multiple filters
  }

  return "universal_filtered"; // Fallback
}

/**
 * Example usage patterns for different chart types
 */
export const QUERY_PATTERNS = {
  // Trend chart - shows data over time with filters
  trendChart: (globalFilters: GlobalFilters) =>
    buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters
    ),

  // Retailer comparison - always includes retailers dimension
  retailerChart: (globalFilters: GlobalFilters) =>
    buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters,
      ["prices.retailer_name"] // Always include retailers
    ),

  // Category comparison - always includes categories dimension
  categoryChart: (globalFilters: GlobalFilters) =>
    buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters,
      ["prices.category_group_name"] // Always include categories
    ),

  // Settlement comparison - always includes settlements dimension
  settlementChart: (globalFilters: GlobalFilters) =>
    buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters,
      ["prices.settlement_name"] // Always include settlements
    ),

  // Municipality comparison - always includes municipalities dimension
  municipalityChart: (globalFilters: GlobalFilters) =>
    buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters,
      ["prices.municipality_name"] // Always include municipalities
    ),

  // Stats cards - no dimensions, just measures
  statsCards: (globalFilters: GlobalFilters) => ({
    measures: ["prices.minRetailPrice", "prices.maxRetailPrice"],
    filters: buildFilters(globalFilters),
  }),
};

/**
 * Debug helper to analyze filter impact on pre-aggregation matching
 */
export function analyzeFilterImpact(globalFilters: GlobalFilters) {
  const dimensions = buildDimensions(globalFilters);
  const expectedPreAgg = predictPreAggregationMatch(globalFilters);

  console.group("🔍 Filter Analysis");
  console.log("Active Filters:", {
    retailers: globalFilters.retailers?.length || 0,
    settlements: globalFilters.settlements?.length || 0,
    municipalities: globalFilters.municipalities?.length || 0,
    categories: globalFilters.categories?.length || 0,
  });
  console.log("Required Dimensions:", dimensions);
  console.log("Expected Pre-Aggregation:", expectedPreAgg);
  console.groupEnd();

  return {
    dimensions,
    expectedPreAgg,
    filterCount: dimensions.length,
  };
}
/**
 * Filter value queries for populating dropdowns
 * These queries have no measures, no time filters, and no other filters
 * They should be very fast and match dedicated filter value pre-aggregations
 */
export const FILTER_VALUE_QUERIES = {
  // FAST: Direct queries to source cubes (recommended)
  direct: {
    retailers: {
      dimensions: ["stores.retailer_name"],
      measures: [],
      filters: [],
      order: { "stores.retailer_name": "asc" },
    },
    
    settlements: {
      dimensions: ["stores.settlement_name"],
      measures: [],
      filters: [],
      order: { "stores.settlement_name": "asc" },
    },
    
    municipalities: {
      dimensions: ["stores.municipality_name"],
      measures: [],
      filters: [],
      order: { "stores.municipality_name": "asc" },
    },
    
    categories: {
      dimensions: ["store_categories.name"],
      measures: [],
      filters: [],
      order: { "store_categories.name": "asc" },
    },
  },
  
  // SLOW: Via prices cube with subqueries (avoid if possible)
  viaPrices: {
    retailers: {
      dimensions: ["prices.retailer_name"],
      measures: [],
      filters: [],
      order: { "prices.retailer_name": "asc" },
    },
    
    locations: {
      dimensions: ["prices.settlement_name"],
      measures: [],
      filters: [],
      order: { "prices.settlement_name": "asc" },
    },
    
    categories: {
      dimensions: ["prices.category_group_name"],
      measures: [],
      filters: [],
      order: { "prices.category_group_name": "asc" },
    },
  },
};

/**
 * Extract unique values from filter value query results
 */
export function extractFilterValues(resultSet: any, dimension: string): string[] {
  if (!resultSet) return [];
  
  const pivot = resultSet.tablePivot();
  const values = Array.from(
    new Set(
      pivot
        .map((row: any) => row[dimension] as string)
        .filter(Boolean)
    )
  ).sort();
  
  return values;
}

/**
 * Extract filter values using direct cube queries (fast)
 */
export function extractDirectFilterValues(resultSet: any, filterType: 'retailers' | 'settlements' | 'municipalities' | 'categories'): string[] {
  if (!resultSet) return [];
  
  const dimensionMap = {
    retailers: "stores.retailer_name",
    settlements: "stores.settlement_name",
    municipalities: "stores.municipality_name",
    categories: "store_categories.name"
  };
  
  return extractFilterValues(resultSet, dimensionMap[filterType]);
}

/**
 * Process all filter values from combined query result
 */
export function processAllFilterValues(resultSet: any) {
  return {
    retailers: extractFilterValues(resultSet, "prices.retailer_name"),
    locations: extractFilterValues(resultSet, "prices.settlement_name"),
    categories: extractFilterValues(resultSet, "prices.category_group_name"),
  };
}

/**
 * Performance expectations for filter value queries
 */
export const FILTER_VALUE_PERFORMANCE = {
  target: 200,      // Target: < 200ms
  acceptable: 500,  // Acceptable: < 500ms
  problem: 1000,    // Problem: > 1000ms
};

/**
 * Analyze filter value query performance
 */
export function analyzeFilterValuePerformance(executionTime: number, queryType: string) {
  const { target, acceptable, problem } = FILTER_VALUE_PERFORMANCE;
  
  let status: 'excellent' | 'good' | 'acceptable' | 'problem';
  let message: string;
  
  if (executionTime < target) {
    status = 'excellent';
    message = `🚀 Excellent performance for ${queryType}`;
  } else if (executionTime < acceptable) {
    status = 'good';
    message = `✅ Good performance for ${queryType}`;
  } else if (executionTime < problem) {
    status = 'acceptable';
    message = `⚠️ Acceptable but could be faster for ${queryType}`;
  } else {
    status = 'problem';
    message = `🐌 Performance problem for ${queryType} - check pre-aggregation matching`;
  }
  
  console.log(`📊 Filter Value Performance: ${message} (${executionTime}ms)`);
  
  return { status, message, executionTime };
}