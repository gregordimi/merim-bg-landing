# Cube Dashboard - Simple Architecture

## Overview
This dashboard provides a simple, straightforward architecture for displaying Cube.js analytics charts with minimal complexity.

## Key Features

### 1. Simple Data Flow
- **Prefetching**: Both chart queries load upfront before rendering UI
- **No caching complexity**: Fresh data on every page load
- **Direct rendering**: Data flows straight from query to chart
- **Client-side filtering**: Retailer filter works on loaded data

### 2. Clean Architecture
- **chartConfigs.ts**: Centralized chart configurations
- **components/Chart.tsx**: Generic chart component
- **ChartViewer.tsx**: Chart rendering logic
- **QueryRenderer.tsx**: Simple data fetching wrapper
- **App.tsx**: Prefetches all data before showing UI

### 3. Easy to Extend
Adding a new chart requires updating `chartConfigs.ts` and `App.tsx`

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
Enable per-chart by setting `enableRetailerFilter: true` in chart config. The filter extracts retailer names from the loaded chart data and filters client-side.

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

## How It Works

1. **App loads**: `ChartsContent` component mounts
2. **Prefetch**: Both retailer and category queries fire immediately
3. **Wait**: Shows skeleton until BOTH queries complete
4. **Render**: Once data is ready, shows tabs with charts
5. **Tab switching**: Charts stay mounted, just hidden/shown with CSS
6. **Filtering**: Retailer dropdown filters data client-side (no new query)

## Migration from Old Code

The old `RetailerChart.tsx` and `CategoryChart.tsx` are now replaced by:
- Single `Chart` component
- Configurations in `chartConfigs.ts`

You can safely delete the old chart files after verifying the new implementation works.
