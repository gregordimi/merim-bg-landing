/**
 * filterUtils.ts
 *
 * This file contains types and helper functions for building dynamic,
 * optimized Cube.js queries based on a global filter state.
 */

import { Query } from "@cubejs-client/core";

// =================================================================
// CORE TYPES
// =================================================================

/**
 * Defines the available preset options for the date range selector.
 */
export type DateRangePreset =
  | "today"
  | "last3days"
  | "last7days"
  | "last30days"
  | "last3months"
  | "last7inclToday";

/**
 * Maps DateRangePreset values to Cube.js relative date strings.
 */
export const DATE_PRESET_TO_CUBE_STRING: Record<DateRangePreset, string> = {
  today: "today",
  last3days: "last 3 days",
  last7days: "last 7 days",
  last30days: "last 30 days",
  last3months: "last 3 months",
  last7inclToday: "from 7 days ago to now",
};

/**
 * Defines the available granularity options for time dimensions.
 */
export type TimeGranularity = "day" | "week" | "month";

/**
 * Represents the global filter state used throughout the application.
 * All properties are optional to allow for flexible initial states.
 */
export interface GlobalFilters {
  retailers?: string[];
  settlements?: string[];
  municipalities?: string[];
  categories?: string[];
  datePreset?: DateRangePreset;
  granularity?: TimeGranularity;
}

/**
 * A minimal, safe type for a Cube.js ResultSet to avoid using `any`.
 */
interface CubeRow {
  [key: string]: string | number | boolean | null;
}
export interface CubeResultSet {
  tablePivot: () => CubeRow[];
}

// =================================================================
// QUERY BUILDING UTILITIES
// =================================================================

/**
 * Builds a Cube.js filters array from the GlobalFilters state.
 * @param globalFilters The current global filter state.
 * @returns An array of Cube.js filter objects.
 */
export function buildFilters(globalFilters: GlobalFilters) {
  const filters = [];

  if ((globalFilters.retailers ?? []).length > 0) {
    filters.push({
      member: "prices.retailer_name",
      operator: "equals" as const,
      values: globalFilters.retailers!,
    });
  }

  if ((globalFilters.settlements ?? []).length > 0) {
    filters.push({
      member: "prices.settlement_name",
      operator: "equals" as const,
      values: globalFilters.settlements!,
    });
  }

  if ((globalFilters.municipalities ?? []).length > 0) {
    filters.push({
      member: "prices.municipality_name",
      operator: "equals" as const,
      values: globalFilters.municipalities!,
    });
  }

  if ((globalFilters.categories ?? []).length > 0) {
    filters.push({
      member: "prices.category_group_name",
      operator: "equals" as const,
      values: globalFilters.categories!,
    });
  }

  return filters;
}

/**
 * Builds the timeDimensions part of a Cube.js query.
 * @param preset The date preset to use.
 * @param granularity The time granularity for aggregation.
 * @returns A configured timeDimensions array.
 */
export function buildTimeDimensions(
  preset: DateRangePreset = "last7days",
  granularity: TimeGranularity = "day"
) {
  return [
    {
      dimension: "prices.price_date",
      granularity: granularity,
      dateRange: DATE_PRESET_TO_CUBE_STRING[preset],
    },
  ];
}

/**
 * Builds a dimensions array based on which filters are active.
 * This is crucial for matching pre-aggregations.
 * @param globalFilters The current global filter state.
 * @returns An array of dimension names.
 */
export function buildDimensions(globalFilters: GlobalFilters): string[] {
  const dimensions = [];

  if ((globalFilters.retailers ?? []).length > 0)
    dimensions.push("prices.retailer_name");
  if ((globalFilters.settlements ?? []).length > 0)
    dimensions.push("prices.settlement_name");
  if ((globalFilters.municipalities ?? []).length > 0)
    dimensions.push("prices.municipality_name");
  if ((globalFilters.categories ?? []).length > 0)
    dimensions.push("prices.category_group_name");

  return dimensions;
}

/**
 * Builds a complete, optimized query that is designed to match pre-aggregations.
 * It intelligently adds dimensions and avoids duplication.
 * @param measures An array of measure names to include.
 * @param globalFilters The current global filter state.
 * @param additionalDimensions Any extra dimensions required by a specific chart.
 * @returns A complete Cube.js Query object.
 */
export function buildOptimizedQuery(
  measures: string[],
  globalFilters: GlobalFilters,
  additionalDimensions: string[] = []
): Query {
  const filteredDimensions = buildDimensions(globalFilters);
  const finalDimensions = new Set([
    ...filteredDimensions,
    ...additionalDimensions,
  ]);

  return {
    measures,
    dimensions: Array.from(finalDimensions),
    timeDimensions: buildTimeDimensions(
      globalFilters.datePreset,
      globalFilters.granularity
    ),
    filters: buildFilters(globalFilters),
    order: {
      "prices.price_date": "asc" as const,
    },
  };
}

// =================================================================
// CHART-SPECIFIC QUERY PATTERNS
// =================================================================

/**
 * A collection of pre-defined query builders for different chart types.
 */
export const QUERY_PATTERNS = {
  trendChart: (globalFilters: GlobalFilters) =>
    buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters
    ),

  retailerChart: (globalFilters: GlobalFilters) =>
    buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters,
      ["prices.retailer_name"]
    ),

  // ... other chart patterns
};

// =================================================================
// FILTER VALUE EXTRACTION
// =================================================================

/**
 * Queries for fetching unique values to populate filter dropdowns.
 * These should be fast and hit dedicated pre-aggregations.
 */
export const FILTER_VALUE_QUERIES = {
  direct: {
    retailers: {
      dimensions: ["stores.retailer_name"],
      order: { "stores.retailer_name": "asc" },
    },
    settlements: {
      dimensions: ["stores.settlement_name"],
      order: { "stores.settlement_name": "asc" },
    },
    municipalities: {
      dimensions: ["stores.municipality_name"],
      order: { "stores.municipality_name": "asc" },
    },
    categories: {
      dimensions: ["store_categories.name"],
      order: { "store_categories.name": "asc" },
    },
  },
};

/**
 * Extracts a sorted list of unique string values from a query result set.
 * @param resultSet The result set from a Cube.js query.
 * @param dimension The dimension name to extract values from.
 * @returns A sorted array of unique strings.
 */
export function extractFilterValues(
  resultSet: CubeResultSet | undefined,
  dimension: string
): string[] {
  if (!resultSet) return [];

  const pivot = resultSet.tablePivot();
  const values = new Set(
    pivot.map((row: CubeRow) => row[dimension] as string).filter(Boolean)
  );

  return Array.from(values).sort();
}
