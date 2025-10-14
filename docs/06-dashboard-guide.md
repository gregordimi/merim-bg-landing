# Dashboard Guide

## Overview

The **Analytics Dashboard** (`/dashboard-sidebar`) is a comprehensive business intelligence tool for retail price analysis. It provides an intuitive interface with sidebar navigation, powerful filtering capabilities, and a variety of interactive charts.

### Key Features

- **Sidebar Navigation**: Access 19 different charts organized into 4 categories
- **Advanced Filtering**: Dialog-based filters with search, confirmation, and max selection limits
- **Relative Date Presets**: Quick date range selection (Today, Last 3/7/30 Days, etc.)
- **Individual Chart Routes**: Each chart has its own URL for easy bookmarking and sharing
- **Debug Mode**: Accessible via `?dev=1` URL parameter for development insights
- **Professional Charts**: Modern styled components using enhanced ChartWrapper with centralized configuration
- **Simplified Chart Creation**: Unified chart architecture with minimal code duplication

---

## User Guide

### Accessing the Dashboard

Navigate to `/dashboard-sidebar` to access the main dashboard. The system will automatically redirect to the first chart (Stats Cards).

### Navigation

#### Sidebar

The sidebar contains all available charts organized into categories:

**Overview** (5 charts)
- Stats Cards - Min/Max price statistics
- Stats Cards Table - Comprehensive price data table
- Price Trends - Retail and promo price trends over time
- Styled Price Trends - Modern gradient area charts
- Category Comparison - Average prices by category

**Competitor** (5 charts)
- Retailer Price Trends - Retail prices by retailer over time
- Retailer Promo Trends - Promotional prices by retailer
- Retailer Discount Trends - Discount percentages by retailer
- Retailer Price Comparison - Price comparison across retailers
- Discount Rates - Discount rate comparison

**Category** (3 charts)
- Category Price Trends - Price trends by category
- Category Price Range - Min/Avg/Max prices by category
- Category Distribution (Pie) - Visual category breakdown

**Geographical** (3 charts)
- Regional Trends - Price trends by region
- Settlement Comparison - Prices across settlements
- Municipality Comparison - Prices across municipalities

**Experimental** (3 charts)
- Optimized Trends - Performance-optimized trend chart
- Simple Trends - Lightweight trend visualization
- Retailer Performance Radar - Multi-dimensional radar chart

#### Collapsible Sidebar

Click the toggle button (☰) to collapse the sidebar. When collapsed, Lucide icons represent each chart for easy identification.

#### Breadcrumb Navigation

Use the breadcrumb trail at the top to navigate:
```
Dashboard > [Category] > [Chart Name]
```

### Filter Panel

The filter panel at the top allows you to control what data appears in all charts.

#### Filter Types

**1. Retailers** (Dialog-based)
- Click to open a searchable dialog
- Search for retailers by name
- Select up to 5 retailers (max limit)
- Click "Confirm" to apply or "Cancel" to discard

**2. Settlements** (Dialog-based)
- Searchable dialog for settlements
- Select up to 10 settlements (max limit)
- Confirmation required

**3. Municipalities** (Dialog-based)
- Searchable dialog for municipalities
- Select up to 8 municipalities (max limit)
- Confirmation required

**4. Categories** (Multi-select dropdown)
- Standard multi-select dropdown
- Select up to 6 categories (max limit)
- No separate confirmation needed

**5. Date Range** (Preset buttons)
- **Today**: Current day only
- **Last 3 Days**: Last 3 days including today
- **Last 7 Days**: Last 7 days (DEFAULT)
- **Last 30 Days**: Last 30 days
- **Last Month**: Previous calendar month
- **Last 3 Months**: Last 3 calendar months
- **Last Year**: Previous 12 months

#### Filter Actions

**Apply Filters** (Primary button)
- Applies all pending filter changes
- Triggers data refresh for all charts
- Only enabled when there are pending changes

**Reset** (Secondary button)
- Reverts pending changes back to currently applied filters
- Useful if you made changes but want to start over

**Clear All** (Secondary button)
- Clears all filter selections
- Resets date range to default (Last 7 Days)
- Useful for starting fresh

**Date Only** (Secondary button)
- Clears all dimension filters (retailers, settlements, etc.)
- Keeps only the date range filter
- Useful for seeing overall trends without segmentation

#### Filter Workflow

1. **Select Filters**: Open dialogs and select values
2. **Review Pending Changes**: Badge shows "Pending Changes" when filters are modified
3. **Apply Filters**: Click "Apply Filters" to execute queries with new filters
4. **Wait for Results**: Charts will reload with filtered data

**Important**: Filters are **non-reactive**. Changes won't affect charts until you click "Apply Filters". This prevents accidental query execution and gives you full control.

### Charts

Each chart displays different insights based on the applied filters.

#### Common Features

- **Loading States**: Skeleton loaders while data is fetching
- **Error Handling**: Clear error messages if queries fail
- **No Data States**: Informative message when no data matches filters
- **Responsive Design**: Charts adapt to different screen sizes
- **Tooltips**: Hover over data points for detailed information

#### Chart-Specific Features

**Stats Cards**
- Displays minimum and maximum retail prices
- Color-coded cards for quick identification

**Trend Charts**
- Line/area charts showing price changes over time
- Multiple series for retail vs promotional prices
- Date-based x-axis with configurable granularity

**Category Charts**
- Comparison across product categories
- Bar charts for easy comparison
- Sorted by price or category name

**Geographical Charts**
- Horizontal bar charts for better label readability
- Sorted by average price
- Top N items to prevent overcrowding

**Pie Chart**
- Category distribution as percentages
- Top 8 categories shown
- Summary statistics included

**Radar Chart**
- Multi-dimensional retailer performance
- Shows 3 metrics simultaneously (retail price, promo price, discount %)
- Circular polar grid visualization

### Debug Mode

Enable debug mode by adding `?dev=1` to the URL:
```
/dashboard-sidebar/stats?dev=1
/dashboard-sidebar/category?dev=1
/dashboard-sidebar/trends?dev=1
```

Debug mode automatically activates for all ChartWrapper-based charts and provides:
- **Query Inspection**: View the exact Cube.js query being executed
- **Raw Data Preview**: See the first 10 rows from the result set
- **Processed Chart Data**: View the transformed data structure used by the chart
- **Filter Information**: Display all active filters with counts and values
- **Debug Controls**: Toggle debug panel visibility and show data point counts
- **Performance Insights**: Monitor query execution and data processing

**Note**: Debug mode only works with charts using the new ChartWrapper architecture. Legacy charts using ChartViewer/QueryRenderer will not show debug information.

---

## Developer Guide

### Architecture

#### Component Structure

```
DashboardSidebarPage (main container)
├── DebugProvider (context for ?dev=1)
├── CubeProvider (Cube.js API client)
├── SidebarProvider (sidebar state management)
│   ├── AppSidebar (navigation)
│   └── SidebarInset (main content)
│       ├── FilterPanel (global filters)
│       └── [Active Chart Component]
```

#### State Management

**Global Filters State**
```typescript
const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
  retailers: [],
  settlements: [],
  municipalities: [],
  categories: [],
  datePreset: 'last7days',
});
```

**Stable Filters (Memoized)**
```typescript
const stableFilters = useMemo(() => ({
  retailers: globalFilters.retailers,
  settlements: globalFilters.settlements,
  municipalities: globalFilters.municipalities,
  categories: globalFilters.categories,
  datePreset: globalFilters.datePreset,
}), [
  globalFilters.retailers.join(','),
  globalFilters.settlements.join(','),
  globalFilters.municipalities.join(','),
  globalFilters.categories.join(','),
  globalFilters.datePreset,
]);
```

This memoization prevents unnecessary re-renders and ensures filters only trigger updates when actual values change.

### Adding New Charts

The enhanced ChartWrapper makes creating new charts incredibly simple. You have two approaches:

#### Approach 1: Simple Charts (Recommended)

For standard area or bar charts, use the built-in chart types:

```typescript
// src/components/charts/MyNewChart.tsx
import { useMemo } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from './ChartWrapper';

interface MyNewChartProps {
  globalFilters: GlobalFilters;
}

export const MyNewChart = ({ globalFilters }: MyNewChartProps) => {
  const query = useMemo(() => buildOptimizedQuery(
    ['prices.averageRetailPrice', 'prices.averagePromoPrice'],
    globalFilters,
    ['prices.some_dimension']
  ), [globalFilters]);

  const { resultSet, isLoading, error } = useStableQuery(
    () => query,
    [/* dependency array */],
    'my-new-chart'
  );

  const chartData = useMemo(() => {
    if (!resultSet) return null;
    // Transform your data here
    return resultSet.tablePivot().map(row => ({
      // Map to your chart structure
      name: row['prices.some_dimension'],
      retailPrice: Number(row['prices.averageRetailPrice'] || 0),
      promoPrice: Number(row['prices.averagePromoPrice'] || 0),
    }));
  }, [resultSet]);

  return (
    <ChartWrapper
      title="My New Chart"
      description="Description of what this chart shows"
      isLoading={isLoading}
      error={error}
      chartType="bar" // Choose: "area", "bar", "horizontal-bar", "multiline", "pie", "radar", or "custom"
      data={chartData}
      chartConfigType="category" // or "trend", "comparison", "distribution"
      xAxisKey="name"
      dataKeys={['retailPrice', 'promoPrice']}
      height="medium"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
};
```

#### Approach 2: Custom Charts

For complex charts that need custom rendering (only use if built-in types don't fit):

```typescript
export const MyCustomChart = ({ globalFilters }: MyNewChartProps) => {
  // ... query logic same as above

  return (
    <ChartWrapper
      title="My Custom Chart"
      description="Custom chart implementation"
      isLoading={isLoading}
      error={error}
      chartType="custom" // Use custom type only when necessary
    >
      {/* Your custom chart JSX here */}
      <div className="custom-chart">
        {/* Custom implementation */}
      </div>
    </ChartWrapper>
  );
};
```

**Note**: With the new chart types (horizontal-bar, pie, radar, multiline), you should rarely need custom charts. See the Chart Creation & Migration Guide for examples of each type.

#### 2. Register in CHART_ROUTES

```typescript
// src/pages/DashboardSidebarPage.tsx
import { MyNewChart } from '@/components/charts/MyNewChart';

export const CHART_ROUTES: ChartRoute[] = [
  // ... existing charts
  {
    id: 'my-new-chart',
    name: 'My New Chart',
    description: 'Description of what this chart shows',
    icon: 'BarChart3', // Lucide icon name
    category: 'Overview', // or Competitor, Category, Geographical
    component: MyNewChart,
  },
];
```

#### 3. Test Your Chart

Navigate to `/dashboard-sidebar/my-new-chart` to test your new chart.

### Filter System Architecture

#### FilterPanel Component

**Responsibilities**:
- Manage pending filter state (user selections)
- Display filter dialogs and multi-selects
- Provide action buttons (Apply, Reset, Clear All, Date Only)
- Show pending changes indicator

**Props**:
```typescript
interface FilterPanelProps {
  globalFilters: GlobalFilters;
  onFiltersChange: (filters: GlobalFilters) => void;
}
```

**Key Features**:
- Non-reactive: Changes don't propagate until "Apply" is clicked
- Max selection limits prevent overcrowded charts
- Pending state separate from applied state

#### FilterDialog Component

Dialog-based selector for retailers, settlements, and municipalities.

**Props**:
```typescript
interface FilterDialogProps {
  title: string;
  description: string;
  options: Array<{ label: string; value: string }>;
  selected: string[];
  onChange: (values: string[]) => void;
  maxSelections: number;
  isLoading?: boolean;
}
```

**Features**:
- Search functionality in header
- Checkbox list in scrollable content
- Confirm/Cancel buttons in footer
- Disabled checkboxes when max limit reached

### Query Building

Use the `filterUtils` helpers to build queries:

```typescript
import { buildOptimizedQuery, buildFilters, buildTimeDimensions } from '@/utils/cube/filterUtils';

// Full query with dimensions
const query = buildOptimizedQuery(
  ['prices.averageRetailPrice', 'prices.averagePromoPrice'],
  globalFilters,
  ['prices.retailer_name'] // additional dimensions
);

// Just filters
const filters = buildFilters(globalFilters);

// Just time dimensions
const timeDimensions = buildTimeDimensions(globalFilters.datePreset);
```

### Performance Best Practices

1. **Use buildOptimizedQuery**: This function intelligently matches pre-aggregations
2. **Memoize filter objects**: Prevents unnecessary re-renders
3. **Limit result sets**: Use TOP N, pagination, or filters to reduce data volume
4. **Avoid time dimensions in aggregates**: For charts like CategoryRangeChart, remove time dimensions if not needed
5. **Use WebSocket transport**: Enabled by default for real-time updates
6. **Leverage ChartWrapper**: Built-in chart types (area/bar) are optimized and consistent
7. **Use useStableQuery**: Prevents unnecessary re-queries with stable dependency arrays

### Debugging

#### Enable Debug Mode

Add `?dev=1` to any dashboard URL:
```
/dashboard-sidebar/stats?dev=1
```

Debug mode is automatically detected by ChartWrapper components. When enabled, charts will show:
- Debug toggle button with data point count
- Expandable debug panel with query, raw data, and processed data
- Filter state information
- Performance metrics

**Automatic Detection**: ChartWrapper automatically detects the `?dev=1` URL parameter and enables debug mode when the required props (`query`, `resultSet`, `globalFilters`) are provided.

#### Common Issues

**Issue**: Charts not updating after filter change
**Solution**: Ensure you clicked "Apply Filters" button

**Issue**: "No data" message when data should exist
**Solution**: 
- Check filter combinations (some may result in empty sets)
- Verify date range covers data periods
- Check browser console for query errors

**Issue**: Slow query performance
**Solution**:
- Reduce number of selected dimensions
- Use shorter date ranges
- Check if pre-aggregations are matching (see server logs)

**Issue**: Date filter shows wrong range
**Solution**: Ensure `datePreset` is properly passed to `buildTimeDimensions`

---

## Troubleshooting

### Filter Issues

**Filters not applying**
1. Make sure to click "Apply Filters" button
2. Check for "Pending Changes" badge - if visible, filters haven't been applied yet

**Clear All resets to wrong date**
- Should reset to "Last 7 Days" (default)
- If it doesn't, this is a bug - check FilterPanel.tsx line ~205

**Max selection limit reached**
- Amber warning appears when limit is reached
- Deselect items before selecting new ones
- Limits are: Retailers (5), Settlements (10), Municipalities (8), Categories (6)

### Chart Issues

**Chart shows "Error loading"**
- Check browser console for detailed error
- Verify API connection (check network tab)
- Ensure filters result in valid data combinations

**Chart shows "No data"**
- Try broader filters (fewer selections)
- Expand date range
- Clear all filters and start with date only

**Chart is slow to load**
- Reduce number of selected dimensions
- Use shorter date ranges
- Check server logs for query performance

### Navigation Issues

**Sidebar won't collapse**
- Try clicking the toggle button (☰) again
- Refresh the page if issue persists

**Chart route not found**
- Verify chart ID matches one in CHART_ROUTES
- Check for typos in URL
- Use sidebar navigation instead of manual URL entry

---

## Future Enhancements

### Planned Features

1. **Export Functionality**
   - CSV export for chart data
   - PNG export for chart images
   - PDF reports

2. **Custom Date Ranges**
   - Calendar picker for specific date ranges
   - Relative dates like "Previous Quarter"

3. **Saved Filter Sets**
   - Save frequently used filter combinations
   - Quick apply saved filters

4. **Chart Customization**
   - User-configurable chart settings
   - Color scheme selection
   - Toggle chart elements

5. **Dashboards**
   - Create custom dashboard layouts
   - Combine multiple charts in one view
   - Drag-and-drop dashboard builder

6. **Alerts & Notifications**
   - Price threshold alerts
   - Anomaly detection
   - Email/SMS notifications

### Contributing

To contribute to the dashboard:

1. Follow the architecture patterns described above
2. Test your changes with multiple filter combinations
3. Verify performance with large datasets
4. Document new features in this guide
5. Submit PR with clear description of changes

---

## Technical Reference

### Dependencies

- **React 19.1.1**: UI framework
- **@cubejs-client/react**: Cube.js React integration
- **recharts**: Charting library
- **shadcn/ui**: UI component library
- **lucide-react**: Icon library
- **tailwindcss**: Styling

### File Structure

```
src/
├── pages/
│   └── DashboardSidebarPage.tsx (main dashboard container)
├── components/
│   ├── app-sidebar-dashboard.tsx (sidebar navigation)
│   ├── filters/
│   │   ├── FilterPanel.tsx (filter UI)
│   │   └── FilterDialog.tsx (dialog selector)
│   └── charts/
│       ├── StatsCards.tsx
│       ├── TrendChart.tsx
│       ├── CategoryChart.tsx
│       └── ... (19 total charts)
├── contexts/
│   └── DebugContext.tsx (debug mode provider)
└── utils/
    └── cube/
        └── filterUtils.ts (query building utilities)
```

### API Endpoints

The dashboard uses Cube.js API endpoints:
- **Query endpoint**: `/cubejs-api/v1/load`
- **WebSocket**: For real-time updates (if enabled)

### Environment Variables

Configure in `.env` or hash parameters:
```
VITE_CUBE_API_URL=https://your-cube-api-url
VITE_CUBE_API_TOKEN=your-token
```

Or use hash parameters:
```
#token=your-token&url=https://your-cube-api-url&ws=1
```

---

## Refactored Chart Architecture

All charts in the dashboard have been refactored to follow a consistent, clean architecture pattern:

### Key Improvements

1. **Extracted Data Processing Functions**: Each chart now has dedicated helper functions for data transformation
2. **Error Handling**: All data processing wrapped in try-catch blocks
3. **Consistent Returns**: Always return empty arrays instead of null
4. **Simplified Logic**: Removed complex state management and caching
5. **Better Maintainability**: Separate concerns between data processing and rendering

### Example Pattern

```typescript
// Helper function for data processing
function processChartData(resultSet: any, options?: any) {
  if (!resultSet) return [];
  
  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];
    
    // Data transformation logic
    return pivot.map(row => ({
      // Transform data
    }));
  } catch (error) {
    console.error("Error processing data:", error);
    return [];
  }
}

// Component uses the helper
export function MyChart({ globalFilters }: Props) {
  const { resultSet, isLoading, error } = useStableQuery(/* ... */);
  
  const data = useMemo(() => {
    return processChartData(resultSet, options);
  }, [resultSet, options]);
  
  return <ChartWrapper data={data} /* ... */ />;
}
```

### Benefits

- **Testability**: Helper functions can be unit tested independently
- **Reusability**: Same processing logic can be shared across charts
- **Debugging**: Easier to identify where data transformation fails
- **Performance**: Cleaner memoization dependencies
- **Consistency**: All charts follow the same pattern

## Conclusion

The Analytics Dashboard provides a powerful, user-friendly interface for retail price intelligence. With its advanced filtering, professional charts, intuitive navigation, and clean refactored architecture, it enables users to gain deep insights into pricing trends and competitive positioning.

The recent refactoring has made the codebase more maintainable, testable, and consistent across all 23 chart components.

For questions or support, refer to the codebase documentation or contact the development team.

**Last Updated**: January 2025  
**Version**: 2.1 (Refactored Architecture)
