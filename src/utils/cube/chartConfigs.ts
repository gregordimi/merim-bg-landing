import { Query, PivotConfig } from '@cubejs-client/core';

export interface ChartConfig {
  id: string;
  title: string;
  description?: string;
  query: Query;
  pivotConfig: PivotConfig;
  enableRetailerFilter?: boolean;
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
    }
  },
  category: {
    id: 'category',
    title: 'Average Retail Price by Category',
    description: 'Compare price trends across product categories',
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
