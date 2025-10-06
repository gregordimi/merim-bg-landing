# Cube Dashboard - Optimized Architecture

## Overview
This dashboard provides a performant, scalable architecture for displaying Cube.js analytics charts with minimal code duplication.

## Key Improvements

### 1. Performance Optimizations
- **Memoization**: All components use `memo()` to prevent unnecessary re-renders
- **useMemo hooks**: Chart data and options are memoized to avoid recalculation
- **Optimized CubeAPI**: API instance created once with `useMemo`
- **Efficient data fetching**: Retailer list fetched once and cached

### 2. Separation of Concerns
- **chartConfigs.ts**: Centralized chart configurations
- **hooks/**: Custom hooks for data fetching (e.g., `useRetailerList`)
- **components/Chart.tsx**: Generic chart component
- **ChartViewer.tsx**: Pure rendering logic
- **QueryRenderer.tsx**: Data fetching wrapper

### 3. Scalability
Adding a new chart is now a 3-line change in `chartConfigs.ts`!

## How to Add a New Chart

### Step 1: Add Configuration
Edit `src/utils/cube/chartConfigs.ts`:

```typescript
export const CHART_CONFIGS: Record<string, ChartConfig> = {
  // ... existing configs
  
  myNewChart: {
    id: 'myNewChart',
    title: 'My New Chart Title',
    description: 'Optional description',
    enableRetailerFilter: false, // Set to true if needed
    query: {
      dimensions: ['your.dimension'],
      filters: [
        { values: ['0'], member: 'your.measure', operator: 'notEquals' }
      ],
      timeDimensions: [
        { dimension: 'your.date', granularity: 'day' }
      ],
      measures: ['your.measure']
    },
    pivotConfig: {
      x: ['your.date.day'],
      y: ['your.dimension', 'measures'],
      fillMissingDates: false
    }
  }
};
```

### Step 2: Add Tab (Optional)
If you want a new tab, edit `src/utils/cube/App.tsx`:

```typescript
<TabsList className="grid w-full grid-cols-3 mb-6"> {/* Update cols */}
  <TabsTrigger value="retailer">By Retailer</TabsTrigger>
  <TabsTrigger value="category">By Category</TabsTrigger>
  <TabsTrigger value="myNewChart">My New Chart</TabsTrigger>
</TabsList>

<TabsContent value="myNewChart" className="space-y-6">
  <Chart config={CHART_CONFIGS.myNewChart} chartType={chartType} />
</TabsContent>
```

### Step 3: Add Multiple Charts to Same Tab (Optional)
You can display multiple charts in one tab:

```typescript
<TabsContent value="overview" className="space-y-6">
  <Chart config={CHART_CONFIGS.retailer} chartType={chartType} />
  <Chart config={CHART_CONFIGS.category} chartType={chartType} />
  <Chart config={CHART_CONFIGS.myNewChart} chartType={chartType} />
</TabsContent>
```

## Architecture

```
src/utils/cube/
├── App.tsx                    # Main dashboard component
├── chartConfigs.ts            # ⭐ Chart configurations (add new charts here)
├── ChartViewer.tsx            # Memoized chart rendering
├── QueryRenderer.tsx          # Memoized data fetching wrapper
├── config.ts                  # Hash config extraction
├── types.ts                   # TypeScript types
├── components/
│   └── Chart.tsx              # Generic chart component with filters
└── hooks/
    └── useRetailerList.ts     # Retailer data fetching hook
```

## Features

### Retailer Filtering
Enable per-chart by setting `enableRetailerFilter: true` in chart config. The filter automatically appears when retailers are available.

### Chart Types
Supported via `VITE_CHART_TYPE` env variable:
- `line` (default)
- `area`
- `bar`
- `pie`
- `doughnut`

### WebSocket Support
Enable real-time updates with `VITE_CUBE_API_USE_WEBSOCKETS=true`

## Environment Variables

```env
VITE_CUBE_API_URL=https://your-cube-api.com
VITE_CUBE_API_TOKEN=your-token
VITE_CHART_TYPE=line
VITE_CUBE_API_USE_WEBSOCKETS=false
```

## Performance Tips

1. **Avoid prop drilling**: Use CubeProvider context instead of passing apiUrl/apiToken
2. **Memoize expensive operations**: Use `useMemo` for data transformations
3. **Lazy load charts**: Use React.lazy() for charts not immediately visible
4. **Debounce filters**: Add debouncing to filter inputs if needed
5. **Pagination**: For large datasets, implement pagination in queries

## Migration from Old Code

The old `RetailerChart.tsx` and `CategoryChart.tsx` are now replaced by:
- Single `Chart` component
- Configurations in `chartConfigs.ts`

You can safely delete the old chart files after verifying the new implementation works.
