import { Query, PivotConfig } from "@cubejs-client/core";

export interface ChartConfig {
  id: string;
  title: string;
  description?: string;
  query: Query;
  pivotConfig: PivotConfig;
  enableRetailerFilter?: boolean;
  retailerQuery?: Query; // Custom query to fetch retailer list
  decimals?: number; // Number of decimal places (default: 2)
  currency?: string; // Currency symbol (default: 'лв')
  dateFormat?: Intl.DateTimeFormatOptions; // Custom date format
}

// Centralized chart configurations
export const CHART_CONFIGS: Record<string, ChartConfig> = {
  retailer: {
    id: "retailer",
    title: "Average Retail Price by Retailer",
    description: "Track price trends across different retailers over time",
    enableRetailerFilter: true,
    query: {
      dimensions: ["retailers.name"],
      filters: [],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days", // Get last 30 days of data
        },
      ],
      measures: ["prices.averageRetailPrice"],
      order: {
        "prices.price_date": "asc",
      },
    },
    pivotConfig: {
      x: ["prices.price_date.day"],
      y: ["retailers.name", "measures"],
      fillMissingDates: true, // Fill missing dates to show all retailers
    },
    // Custom query to get ALL retailers (not filtered by date/price)
    // This ensures the dropdown shows all retailers, even those without recent data
    retailerQuery: {
      dimensions: ["retailers.name"],
      measures: [],
      filters: [],
      timeDimensions: [],
      order: {
        "retailers.name": "asc",
      },
    },
    // Note: The chart will only show retailers that have at least ONE data point
    // in the last 30 days. Retailers with no data in this period won't appear
    // on the chart initially, but can be selected from the dropdown.
  },
  category: {
    id: "category",
    title: "Average Retail Price by Category",
    description: "Compare price trends across product categories",
    decimals: 2, // Round to 2 decimal places
    currency: "лв", // Bulgarian Lev
    dateFormat: { month: "short", day: "numeric" }, // "Jan 15" format
    query: {
      dimensions: ["category_groups.name"],
      filters: [],
      timeDimensions: [
        {
          dimension: "prices.price_date",
          granularity: "day",
          dateRange: "Last 30 days",
        },
      ],
      measures: ["prices.averageRetailPrice"],
      order: {
        "prices.price_date": "asc",
      },
    },
    pivotConfig: {
      x: ["prices.price_date.day"],
      y: ["category_groups.name", "measures"],
      fillMissingDates: true,
    },
  },
  // Add more chart configs here easily
};
