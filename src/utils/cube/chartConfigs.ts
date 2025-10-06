import { Query, PivotConfig } from '@cubejs-client/core';

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
    id: 'retailer',
    title: 'Average Retail Price by Retailer',
    description: 'Track price trends across different retailers over time',
    enableRetailerFilter: true,
    query: {
      dimensions: ['retailers.name'],
      filters: [
        { values: ['0'], member: 'prices.averageRetailPrice', operator: 'notEquals' }
      ],
      timeDimensions: [
        { dimension: 'prices.price_date', granularity: 'day' }
      ],
      measures: ['prices.averageRetailPrice']
    },
    pivotConfig: {
      x: ['prices.price_date.day'],
      y: ['retailers.name', 'measures'],
      fillMissingDates: false
    },
    // Custom query to get ALL retailers (not filtered by date/price)
    retailerQuery: {
      dimensions: ['retailers.name'],
      measures: [],
      filters: [],
      timeDimensions: []
    }
  },
  category: {
    id: 'category',
    title: 'Average Retail Price by Category',
    description: 'Compare price trends across product categories',
    decimals: 2, // Round to 2 decimal places
    currency: 'лв', // Bulgarian Lev
    dateFormat: { month: 'short', day: 'numeric' }, // "Jan 15" format
    query: {
      dimensions: ['category_groups.name'],
      filters: [
        { values: ['0'], member: 'prices.averageRetailPrice', operator: 'notEquals' }
      ],
      timeDimensions: [
        { dimension: 'prices.price_date', granularity: 'day' }
      ],
      measures: ['prices.averageRetailPrice']
    },
    pivotConfig: {
      x: ['prices.price_date.day'],
      y: ['category_groups.name', 'measures'],
      fillMissingDates: false
    }
  }
  // Add more chart configs here easily
};
