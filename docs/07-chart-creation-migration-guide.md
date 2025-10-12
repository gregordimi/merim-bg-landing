# Chart Creation & Migration Guide

## Overview

This guide covers how to create new charts and migrate existing charts to use the enhanced **ChartWrapper** architecture. The new system dramatically reduces code duplication and provides consistent styling across all charts.

---

## Enhanced ChartWrapper Architecture

### Key Benefits

- **90% Code Reduction**: Charts go from 150-200 lines to 50-80 lines
- **Consistent Styling**: All charts automatically get modern shadcn/ui styling
- **Type Safety**: Full TypeScript support with proper error handling
- **Built-in Features**: Loading states, error handling, trend indicators, tooltips
- **Centralized Configuration**: Colors, margins, and styling managed in one place
- **Automatic Debug Mode**: Debug functionality automatically enabled with `?dev=1` URL parameter
- **Centralized Debug UI**: Consistent debug interface across all charts

### Supported Chart Types

1. **`area`**: Area charts with gradients (perfect for trends)
2. **`bar`**: Bar charts with rounded corners (perfect for categories)
3. **`custom`**: Fallback for complex custom implementations

---

## Creating New Charts

### Simple Area Chart (Trend Data)

```typescript
import { useMemo } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "./ChartWrapper";

interface TrendChartProps {
  globalFilters: GlobalFilters;
}

export function MyTrendChart({ globalFilters }: TrendChartProps) {
  const query = useMemo(
    () =>
      buildOptimizedQuery(
        ["prices.averageRetailPrice", "prices.averagePromoPrice"],
        globalFilters
      ),
    [globalFilters]
  );

  const { resultSet, isLoading, error } = useStableQuery(
    () => query,
    [
      globalFilters.retailers?.join(",") ?? "",
      globalFilters.datePreset ?? "last7days",
    ],
    "my-trend-chart"
  );

  const chartData = useMemo(() => {
    if (!resultSet) return null;
    return resultSet.tablePivot().map((row) => ({
      date: row["prices.price_date.day"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ChartWrapper
      title="Price Trends Over Time"
      description="Track retail and promotional price changes"
      isLoading={isLoading}
      error={error}
      chartType="area"
      data={chartData}
      chartConfigType="trend"
      xAxisKey="date"
      xAxisFormatter={formatDate}
      dataKeys={["retailPrice", "promoPrice"]}
      showGradients={true}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
```

### Simple Bar Chart (Category Data)

```typescript
export function MyCategoryChart({ globalFilters }: CategoryChartProps) {
  // ... query logic similar to above

  const chartData = useMemo(() => {
    if (!resultSet) return null;
    return resultSet.tablePivot().map((row) => ({
      category: row["prices.category_group_name"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Prices by Category"
      description="Compare prices across product categories"
      isLoading={isLoading}
      error={error}
      chartType="bar"
      data={chartData}
      chartConfigType="category"
      xAxisKey="category"
      dataKeys={["retailPrice", "promoPrice"]}
      height="large" // More space for category labels
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
```

### Custom Chart (Complex Implementations)

```typescript
export function MyCustomChart({ globalFilters }: CustomChartProps) {
  // ... query logic

  return (
    <ChartWrapper
      title="Custom Chart"
      description="Complex custom implementation"
      isLoading={isLoading}
      error={error}
      chartType="custom"
    >
      {/* Your custom chart implementation */}
      <div className="custom-chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            {/* Complex chart setup */}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartWrapper>
  );
}
```

---

## Migration Guide

### Before: Old Chart Structure

```typescript
// OLD WAY - 150+ lines of code
export function OldChart({ globalFilters }: ChartProps) {
  const [lastValidData, setLastValidData] = useState([]);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  // Complex query logic
  const query = useMemo(() => {
    // Manual query building
  }, [globalFilters]);

  const { resultSet, isLoading, error } = useStableQuery(/* ... */);

  // Complex data processing
  const chartData = useMemo(() => {
    // Data transformation logic
  }, [resultSet]);

  // Complex loading state management
  useEffect(() => {
    if (chartData && chartData.length > 0 && !isLoading) {
      setLastValidData(chartData);
      setHasEverLoaded(true);
    }
  }, [chartData, isLoading]);

  const displayData = chartData || lastValidData;
  const shouldShowLoading = isLoading && !hasEverLoaded;

  // Manual loading state
  if (shouldShowLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Manual error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chart Title</CardTitle>
          <CardDescription>Unable to load chart data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-sm">{error.message || "Failed to load data"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Manual chart rendering
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart Title</CardTitle>
        <CardDescription>Chart description</CardDescription>
      </CardHeader>
      <CardContent>
        {displayData && displayData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="fillRetail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1} />
                </linearGradient>
                {/* More gradient definitions */}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="retailPrice"
                stroke="#0088FE"
                fill="url(#fillRetail)"
                strokeWidth={2}
              />
              {/* More areas */}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### After: New Chart Structure

```typescript
// NEW WAY - 50 lines of code
export function NewChart({ globalFilters }: ChartProps) {
  const query = useMemo(
    () =>
      buildOptimizedQuery(
        ["prices.averageRetailPrice", "prices.averagePromoPrice"],
        globalFilters
      ),
    [globalFilters]
  );

  const { resultSet, isLoading, error } = useStableQuery(
    () => query,
    [globalFilters.retailers?.join(",") ?? ""],
    "new-chart"
  );

  const chartData = useMemo(() => {
    if (!resultSet) return null;
    return resultSet.tablePivot().map((row) => ({
      date: row["prices.price_date.day"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Chart Title"
      description="Chart description"
      isLoading={isLoading}
      error={error}
      chartType="area"
      data={chartData}
      chartConfigType="trend"
      xAxisKey="date"
      dataKeys={["retailPrice", "promoPrice"]}
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
```

### Migration Steps

1. **Remove Complex State Management**

   - Delete `useState` for `lastValidData`, `hasEverLoaded`
   - Remove `useEffect` for data caching
   - Remove `shouldShowLoading` logic

2. **Simplify Data Processing**

   - Keep only the essential `chartData` useMemo
   - Remove complex display data logic

3. **Replace Manual Rendering**

   - Remove manual Card, loading, and error JSX
   - Remove manual chart component setup
   - Replace with single `<ChartWrapper>` component

4. **Configure ChartWrapper**

   - Set appropriate `chartType` (area/bar/custom)
   - Choose correct `chartConfigType` (trend/category/comparison/distribution)
   - Define `xAxisKey` and `dataKeys`
   - Add formatters if needed

5. **Test and Verify**
   - Ensure data structure matches expected format
   - Verify colors and styling look correct
   - Test loading and error states

---

## Chart Configuration Types

### Trend Charts (`chartConfigType="trend"`)

**Use for**: Time-series data, price trends over time

**Data Structure**:

```typescript
{
  date: string,        // x-axis
  retailPrice: number, // First data series
  promoPrice: number,  // Second data series
}
```

**Configuration**:

```typescript
<ChartWrapper
  chartType="area"
  chartConfigType="trend"
  xAxisKey="date"
  dataKeys={["retailPrice", "promoPrice"]}
  showGradients={true}
/>
```

### Category Charts (`chartConfigType="category"`)

**Use for**: Categorical comparisons, prices by category/retailer

**Data Structure**:

```typescript
{
  category: string,    // x-axis (or any categorical field)
  retailPrice: number, // First data series
  promoPrice: number,  // Second data series
}
```

**Configuration**:

```typescript
<ChartWrapper
  chartType="bar"
  chartConfigType="category"
  xAxisKey="category"
  dataKeys={["retailPrice", "promoPrice"]}
  height="large" // More space for labels
/>
```

### Comparison Charts (`chartConfigType="comparison"`)

**Use for**: Side-by-side comparisons, A/B testing

**Data Structure**:

```typescript
{
  name: string,   // x-axis
  value1: number, // First comparison
  value2: number, // Second comparison
  value3: number, // Third comparison (optional)
}
```

### Distribution Charts (`chartConfigType="distribution"`)

**Use for**: Pie charts, distribution analysis

**Data Structure**:

```typescript
{
  segment: string, // Segment name
  value: number,   // Segment value
}
```

---

## Debug Mode Integration

### Automatic Debug Detection

ChartWrapper automatically detects debug mode from the URL parameter `?dev=1`. When enabled and the required debug props are provided, it shows a comprehensive debug interface.

### Adding Debug Support to Charts

To enable debug functionality, simply pass the debug props to ChartWrapper:

```typescript
export function MyChart({ globalFilters }: ChartProps) {
  const query = useMemo(() => buildOptimizedQuery(
    ['prices.averageRetailPrice'],
    globalFilters
  ), [globalFilters]);

  const { resultSet, isLoading, error } = useStableQuery(
    () => query,
    [/* dependencies */],
    'my-chart'
  );

  const chartData = useMemo(() => {
    // Data transformation logic
  }, [resultSet]);

  return (
    <ChartWrapper
      title="My Chart"
      isLoading={isLoading}
      error={error}
      chartType="area"
      data={chartData}
      // Debug props - automatically used when ?dev=1 is in URL
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}
```

### Debug Features

When `?dev=1` is added to the URL, charts automatically show:

1. **Debug Toggle Button**: Shows/hides debug information with data point count
2. **Query Inspector**: Formatted JSON display of the Cube.js query
3. **Raw Data Preview**: First 10 rows from the result set in table format
4. **Processed Data**: Transformed chart data structure
5. **Filter Information**: All active filters with counts and values

### Debug Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `any` | Yes | The Cube.js query object |
| `resultSet` | `any` | Yes | The result set from useStableQuery |
| `globalFilters` | `GlobalFilters` | Yes | The current filter state |

**Note**: Debug functionality only appears when all three props are provided and `?dev=1` is in the URL.

---

## Advanced Features

### Adding Trend Indicators

```typescript
const trend = useMemo(() => {
  if (!chartData || chartData.length < 2) return null;
  const first = chartData[0].retailPrice;
  const last = chartData[chartData.length - 1].retailPrice;
  if (first === 0) return null;
  const change = ((last - first) / first) * 100;
  return {
    value: change.toFixed(1),
    direction: change > 0 ? ("up" as const) : ("down" as const),
  };
}, [chartData]);

<ChartWrapper
  // ... other props
  trend={trend}
/>;
```

### Custom Formatters

```typescript
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatPrice = (value: number) => {
  return `${value.toFixed(2)} лв`;
};

<ChartWrapper
  // ... other props
  xAxisFormatter={formatDate}
  yAxisFormatter={formatPrice}
/>;
```

### Custom Heights

```typescript
<ChartWrapper
  // ... other props
  height="small" // 250px
  height="medium" // 350px (default)
  height="large" // 450px
  height="xl" // 550px
/>
```

---

## Chart Configuration System

### Color Configuration

Colors are managed centrally in `src/config/chartConfig.ts`:

```typescript
export const CHART_COLORS = [
  "#0088FE", // Blue - Primary
  "#00C49F", // Teal - Secondary
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  // ... more colors
];

export const getChartConfig = (
  type: "trend" | "category" | "comparison" | "distribution"
) => {
  switch (type) {
    case "trend":
      return {
        retailPrice: {
          label: "Retail Price",
          color: CHART_COLORS[0], // Blue
        },
        promoPrice: {
          label: "Promo Price",
          color: CHART_COLORS[1], // Teal
        },
      };
    // ... other configurations
  }
};
```

### Adding New Color Schemes

1. **Add to CHART_COLORS array**:

```typescript
export const CHART_COLORS = [
  // ... existing colors
  "#NEW_COLOR", // Your new color
];
```

2. **Create new chart config type**:

```typescript
case 'myNewType':
  return {
    dataKey1: {
      label: "Data 1",
      color: CHART_COLORS[0],
    },
    dataKey2: {
      label: "Data 2",
      color: CHART_COLORS[1],
    },
  };
```

3. **Use in your chart**:

```typescript
<ChartWrapper chartConfigType="myNewType" dataKeys={["dataKey1", "dataKey2"]} />
```

---

## Common Migration Issues

### Issue: Data Structure Mismatch

**Problem**: Chart expects different data structure than provided

**Solution**: Transform data in `chartData` useMemo:

```typescript
const chartData = useMemo(() => {
  if (!resultSet) return null;
  return resultSet.tablePivot().map((row) => ({
    // Map your API response to expected structure
    date: row["prices.price_date.day"],
    retailPrice: Number(row["prices.averageRetailPrice"] || 0),
    promoPrice: Number(row["prices.averagePromoPrice"] || 0),
  }));
}, [resultSet]);
```

### Issue: Colors Not Showing

**Problem**: Chart appears but colors are missing or wrong

**Solutions**:

1. Verify `chartConfigType` matches your data keys
2. Ensure `dataKeys` array matches your data structure
3. Check if chart config has entries for your data keys

### Issue: Axis Labels Overlapping

**Problem**: X-axis labels overlap or are cut off

**Solutions**:

1. Use `height="large"` for more space
2. Add custom `xAxisFormatter` to shorten labels
3. For categories, ChartWrapper automatically rotates labels -45°

### Issue: Loading State Not Working

**Problem**: Chart doesn't show loading skeleton

**Solution**: Ensure you're passing `isLoading` from your query hook:

```typescript
const { resultSet, isLoading, error } = useStableQuery(/* ... */);

<ChartWrapper
  isLoading={isLoading} // Make sure this is passed
  // ... other props
/>;
```

---

## Best Practices

### 1. Data Transformation

Keep data transformation logic clean and focused:

```typescript
const chartData = useMemo(() => {
  if (!resultSet) return null;

  const pivot = resultSet.tablePivot();
  if (!pivot || pivot.length === 0) return null;

  // Transform and clean data
  return pivot
    .map((row) => ({
      name: row["dimension_field"],
      value1: Number(row["measure_field_1"] || 0),
      value2: Number(row["measure_field_2"] || 0),
    }))
    .filter((item) => item.value1 > 0 || item.value2 > 0) // Remove empty data
    .sort((a, b) => b.value1 - a.value1) // Sort by primary value
    .slice(0, 20); // Limit results
}, [resultSet]);
```

### 2. Query Optimization

Use stable dependency arrays to prevent unnecessary re-queries:

```typescript
const { resultSet, isLoading, error } = useStableQuery(
  () => query,
  [
    globalFilters.retailers?.join(",") ?? "",
    globalFilters.settlements?.join(",") ?? "",
    globalFilters.datePreset ?? "last7days",
  ],
  "unique-chart-key"
);
```

### 3. Error Handling

Let ChartWrapper handle errors automatically, but log for debugging:

```typescript
useEffect(() => {
  if (error) {
    console.error("Chart error:", error);
    // Optional: Send to error tracking service
  }
}, [error]);
```

### 4. Performance

For large datasets, implement data limiting:

```typescript
const chartData = useMemo(() => {
  if (!resultSet) return null;

  return resultSet
    .tablePivot()
    .slice(0, 50) // Limit to top 50 items
    .map(/* transformation */);
}, [resultSet]);
```

---

## Testing Your Charts

### 1. Basic Functionality

- [ ] Chart renders without errors
- [ ] Loading state shows skeleton
- [ ] Error state shows error message
- [ ] Data displays correctly when available

### 2. Filter Integration

- [ ] Chart updates when filters change
- [ ] Empty filter combinations show "No data" message
- [ ] All filter types work (retailers, settlements, etc.)

### 3. Responsive Design

- [ ] Chart adapts to different screen sizes
- [ ] Labels remain readable on mobile
- [ ] Tooltips work on touch devices

### 4. Performance

- [ ] Chart loads quickly with typical data volumes
- [ ] No memory leaks during filter changes
- [ ] Smooth interactions (hover, tooltips)

---

## Migration Checklist

When migrating an existing chart:

- [ ] Remove `useState` for data caching
- [ ] Remove `useEffect` for loading state management
- [ ] Remove manual loading/error JSX
- [ ] Remove manual chart component setup
- [ ] Replace with `<ChartWrapper>` component
- [ ] Configure appropriate `chartType` and `chartConfigType`
- [ ] Define correct `xAxisKey` and `dataKeys`
- [ ] Test with various filter combinations
- [ ] Verify colors and styling
- [ ] Check responsive behavior
- [ ] Update any custom formatters
- [ ] Remove unused imports
- [ ] Add debug props (`query`, `resultSet`, `globalFilters`) for debug support

---

## Conclusion

The enhanced ChartWrapper architecture dramatically simplifies chart creation while providing consistent, professional styling. By following this guide, you can:

- Create new charts in minutes instead of hours
- Maintain consistent user experience across all charts
- Focus on data logic instead of UI boilerplate
- Easily extend and customize chart behavior

For complex charts that don't fit the standard patterns, you can always use `chartType="custom"` while still benefiting from the wrapper's loading states, error handling, and consistent card styling.

**Next Steps**:

1. Review the existing charts that need migration
2. Start with simple trend/category charts
3. Move to more complex custom implementations
4. Update documentation as you go

---

## Debug Architecture

### Centralized Debug System

The debug functionality is built into the ChartWrapper architecture:

```
ChartWrapper
├── Automatic URL Detection (?dev=1)
├── Debug Props Validation
├── ChartWrapperDebug Component
│   ├── Debug Toggle Controls
│   ├── Query Inspector
│   ├── Raw Data Table
│   ├── Processed Data Display
│   └── Filter Information Panel
└── Chart Rendering (Normal/Debug Layout)
```

### Debug Component Structure

**ChartWrapperDebug** (`src/config/ChartWrapperDebug.tsx`):
- Reusable debug component used by all charts
- Consistent debug interface across the application
- Handles all debug UI logic and state management

**ChartWrapper** (`src/config/ChartWrapper.tsx`):
- Automatically detects `?dev=1` URL parameter
- Conditionally renders debug component when enabled
- Maintains normal chart functionality when debug is disabled

### Benefits of Centralized Debug

1. **Consistency**: All charts have identical debug interfaces
2. **Maintainability**: Debug improvements benefit all charts instantly
3. **Easy Integration**: Just pass debug props to any ChartWrapper
4. **Performance**: Debug code only loads when needed
5. **Developer Experience**: Familiar debug interface across all charts

### Extending Debug Functionality

To add new debug features, modify `ChartWrapperDebug.tsx`:

```typescript
// Add new debug section
<div>
  <h4 className="font-semibold mb-2">Performance Metrics:</h4>
  <div className="bg-muted p-3 rounded text-sm">
    <p>Query Time: {queryTime}ms</p>
    <p>Data Points: {dataPoints}</p>
    <p>Render Time: {renderTime}ms</p>
  </div>
</div>
```

All charts using ChartWrapper will automatically get the new debug features.

**Last Updated**: January 2025  
**Version**: 1.1 (Enhanced ChartWrapper with Centralized Debug)
