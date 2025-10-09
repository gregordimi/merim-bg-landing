# Retail Price Intelligence Hub Dashboard

## Overview

The Retail Price Intelligence Hub is a comprehensive Business Intelligence dashboard for analyzing retail pricing data across multiple dimensions. Built with React, TypeScript, and Cube.js, it provides powerful data visualization and filtering capabilities.

## Features

### Global Header
- **Key Performance Indicators (KPIs)**
  - Overall Average Retail Price
  - Overall Average Promo Price
  - Average Discount Percentage
  - Real-time data updates

- **Global Filters** (affect all visualizations)
  - Date Range Selector
  - Retailer Multi-Select
  - Location Multi-Select
  - Category Multi-Select

### Dashboard Tabs

#### 📈 Executive Overview
High-level summary with:
- Min/Max/Median price statistics
- Price trends over time (retail vs promo)
- Average price by category

#### 🆚 Competitor Analysis
Retailer comparison featuring:
- Price trends across retailers
- Average price comparisons
- Discount rate analysis

#### 🛒 Category & Product Deep Dive
Category-level insights:
- Category price trends over time
- Price range analysis (min/avg/max)
- Top 10 categories by price

#### 🗺️ Geographical Insights
Regional pricing patterns:
- Regional price trends by municipality
- Top 20 settlements by average price
- Top 15 municipalities comparison

## Technical Implementation

### Tech Stack
- **Frontend**: React 19 + TypeScript
- **Data**: Cube.js for OLAP queries
- **Charts**: Recharts
- **UI Components**: Radix UI + Tailwind CSS
- **Date Handling**: date-fns + react-day-picker

### Key Components

```
src/
├── pages/
│   └── DashboardPage.tsx          # Main dashboard container
├── components/dashboard/
│   ├── DashboardHeader.tsx        # Global KPIs and filters
│   ├── DashboardFilters.tsx       # Filter components
│   ├── ExecutiveOverview.tsx      # Overview tab
│   ├── CompetitorAnalysis.tsx     # Competitor tab
│   ├── CategoryDeepDive.tsx       # Category tab
│   └── GeographicalInsights.tsx   # Geographical tab
└── utils/cube/
    └── ChartViewer.tsx            # Reusable chart component
```

### Cube.js Integration

The dashboard uses Cube.js for efficient data queries with:
- Dynamic filter building based on global selections
- Optimized queries with proper time dimensions
- Support for various granularities (day, week, month)
- Pre-aggregation support (as specified in requirements)

### Global Filter Architecture

Filters are managed at the dashboard level and passed down to all tab components:

```typescript
interface GlobalFilters {
  dateRange?: [string, string];
  retailers?: string[];
  locations?: string[];
  categories?: string[];
}
```

Each tab component receives these filters and builds appropriate Cube.js queries.

## Configuration

### Environment Variables

```bash
VITE_CUBE_API_URL=your_cube_api_url
VITE_CUBE_API_TOKEN=your_cube_api_token
VITE_CUBE_API_USE_WEBSOCKETS=false
```

### Cube.js Schema Requirements

The dashboard expects the following Cube.js schema structure:

**Cubes:**
- `prices` - Main fact table with measures:
  - `averageRetailPrice`
  - `averagePromoPrice`
  - `averageDiscountPercentage`
  - `minRetailPrice`
  - `maxRetailPrice`
  - `medianRetailPrice`

**Dimensions:**
- `prices.price_date` - Time dimension
- `retailers.name` - Retailer name
- `category_groups.name` - Category group
- `stores.settlements.name_en` - Settlement name
- `stores.settlements.municipality` - Municipality name

## Usage

### Accessing the Dashboard

Navigate to `/charts/dashboard` to access the full dashboard.

### Using Global Filters

1. **Date Range**: Click the date picker to select a custom date range
2. **Retailer**: Select one or more retailers from the dropdown
3. **Location**: Filter by settlement/location
4. **Category**: Filter by product category
5. **Clear All**: Click "Clear All" to reset all filters

All visualizations update automatically when filters change.

### Navigation

Switch between analytical views using the tab navigation:
- Click on any tab to view different analytical perspectives
- All tabs respect the global filters
- Data loads on-demand for performance

## Performance Considerations

### Pre-Aggregations

The dashboard is designed to work with Cube.js pre-aggregations for optimal performance:

```javascript
// Recommended pre-aggregations in prices cube
preAggregations: {
  mainRollup: {
    type: 'rollup',
    measures: [
      prices.averageRetailPrice,
      prices.averagePromoPrice,
      prices.averageDiscountPercentage,
    ],
    dimensions: [
      retailers.name,
      category_groups.name,
      stores.settlements.name_en,
    ],
    timeDimension: prices.price_date,
    granularity: 'day'
  }
}
```

### Loading States

- Skeleton loaders shown while data is fetching
- "No data available" messages when queries return empty results
- Automatic retry on connection errors

## Responsive Design

The dashboard is fully responsive:
- **Desktop**: 4-column filter layout, side-by-side charts
- **Tablet**: 2-column layouts, stacked components
- **Mobile**: Single-column layout, simplified navigation

## Theme Support

Supports both light and dark modes:
- Toggle via theme switcher in header
- Persistent theme selection
- All charts and components adapt to theme

## Troubleshooting

### No Data Available
- Verify Cube.js API credentials are correct
- Check that the Cube.js schema includes required measures
- Ensure date range includes data points
- Review browser console for API errors

### Filter Issues
- Clear browser cache and reload
- Reset all filters using "Clear All" button
- Check that dimension names match Cube.js schema

### Performance Issues
- Implement recommended pre-aggregations
- Reduce date range for faster queries
- Limit number of selected filters

## Future Enhancements

Potential improvements:
- Export functionality (CSV, PDF)
- Saved filter presets
- Email reports and alerts
- Advanced drill-down capabilities
- Custom date range presets
- Comparison mode (period over period)
