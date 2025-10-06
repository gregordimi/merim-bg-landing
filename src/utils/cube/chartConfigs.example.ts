import { ChartConfig } from './chartConfigs';

/**
 * Example chart configurations showing various use cases
 * Copy these to chartConfigs.ts and customize as needed
 */

// Example 1: Price comparison with date range
export const priceComparison: ChartConfig = {
  id: 'priceComparison',
  title: 'Price Comparison Over Time',
  description: 'Compare average prices across all dimensions',
  query: {
    dimensions: ['retailers.name', 'category_groups.name'],
    filters: [
      { values: ['0'], member: 'prices.averageRetailPrice', operator: 'notEquals' }
    ],
    timeDimensions: [
      {
        dimension: 'prices.price_date',
        granularity: 'week', // Can be: day, week, month, year
        dateRange: 'Last 30 days' // Or: 'This week', 'This month', 'Last year', etc.
      }
    ],
    measures: ['prices.averageRetailPrice', 'prices.count']
  },
  pivotConfig: {
    x: ['prices.price_date.week'],
    y: ['retailers.name', 'measures'],
    fillMissingDates: true
  }
};

// Example 2: Top performers (no time dimension)
export const topRetailers: ChartConfig = {
  id: 'topRetailers',
  title: 'Top 10 Retailers by Volume',
  description: 'Retailers with highest transaction count',
  query: {
    dimensions: ['retailers.name'],
    measures: ['prices.count'],
    order: {
      'prices.count': 'desc'
    },
    limit: 10
  },
  pivotConfig: {
    x: ['retailers.name'],
    y: ['measures'],
    fillMissingDates: false
  }
};

// Example 3: Multiple measures
export const priceMetrics: ChartConfig = {
  id: 'priceMetrics',
  title: 'Price Metrics Dashboard',
  description: 'Average, min, and max prices over time',
  query: {
    dimensions: [],
    timeDimensions: [
      { dimension: 'prices.price_date', granularity: 'day' }
    ],
    measures: [
      'prices.averageRetailPrice',
      'prices.minPrice',
      'prices.maxPrice'
    ]
  },
  pivotConfig: {
    x: ['prices.price_date.day'],
    y: ['measures'],
    fillMissingDates: true
  }
};

// Example 4: Category breakdown with filters
export const categoryBreakdown: ChartConfig = {
  id: 'categoryBreakdown',
  title: 'Category Price Distribution',
  description: 'Price distribution across product categories',
  query: {
    dimensions: ['category_groups.name'],
    filters: [
      { 
        values: ['0'], 
        member: 'prices.averageRetailPrice', 
        operator: 'notEquals' 
      },
      {
        values: ['100'],
        member: 'prices.averageRetailPrice',
        operator: 'gt' // Greater than 100
      }
    ],
    measures: ['prices.averageRetailPrice'],
    order: {
      'prices.averageRetailPrice': 'desc'
    }
  },
  pivotConfig: {
    x: ['category_groups.name'],
    y: ['measures'],
    fillMissingDates: false
  }
};

// Example 5: Retailer-specific with custom filter
export const retailerTrends: ChartConfig = {
  id: 'retailerTrends',
  title: 'Retailer Price Trends',
  description: 'Track price changes for specific retailers',
  enableRetailerFilter: true, // Enables the retailer dropdown
  query: {
    dimensions: ['retailers.name'],
    filters: [
      { values: ['0'], member: 'prices.averageRetailPrice', operator: 'notEquals' }
    ],
    timeDimensions: [
      { dimension: 'prices.price_date', granularity: 'day' }
    ],
    measures: ['prices.averageRetailPrice', 'prices.count']
  },
  pivotConfig: {
    x: ['prices.price_date.day'],
    y: ['retailers.name', 'measures'],
    fillMissingDates: false
  }
};

// Example 6: Year-over-year comparison
export const yearOverYear: ChartConfig = {
  id: 'yearOverYear',
  title: 'Year-over-Year Price Comparison',
  description: 'Compare prices across different years',
  query: {
    dimensions: ['category_groups.name'],
    timeDimensions: [
      {
        dimension: 'prices.price_date',
        granularity: 'month',
        dateRange: 'Last 2 years'
      }
    ],
    measures: ['prices.averageRetailPrice']
  },
  pivotConfig: {
    x: ['prices.price_date.month'],
    y: ['category_groups.name', 'measures'],
    fillMissingDates: true
  }
};

/**
 * Common filter operators:
 * - 'equals'
 * - 'notEquals'
 * - 'contains'
 * - 'notContains'
 * - 'gt' (greater than)
 * - 'gte' (greater than or equal)
 * - 'lt' (less than)
 * - 'lte' (less than or equal)
 * - 'set' (not null)
 * - 'notSet' (is null)
 * - 'inDateRange'
 * - 'notInDateRange'
 * - 'beforeDate'
 * - 'afterDate'
 */

/**
 * Common date ranges:
 * - 'Today'
 * - 'Yesterday'
 * - 'This week'
 * - 'This month'
 * - 'This quarter'
 * - 'This year'
 * - 'Last 7 days'
 * - 'Last 30 days'
 * - 'Last week'
 * - 'Last month'
 * - 'Last quarter'
 * - 'Last year'
 * - Custom: ['2024-01-01', '2024-12-31']
 */
