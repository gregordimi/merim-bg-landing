# Practical Filter Examples

## 🎯 How to Use Filters with Pre-Aggregations

Now that you have filtered pre-aggregations, here's how to use them in your actual charts:

## 📋 Key Rule: Include Filtered Dimensions

**CRITICAL**: Any dimension you filter on MUST be included in the query dimensions for pre-aggregation matching.

### ❌ Wrong Way (Won't Match Pre-Aggregations)
```javascript
// This query will NOT match pre-aggregations
const query = {
  measures: ["prices.averageRetailPrice"],
  timeDimensions: [{
    dimension: "prices.price_date",
    granularity: "day",
    dateRange: "Last 30 days"
  }],
  filters: [
    { member: "retailers.name", operator: "equals", values: ["Kaufland"] }
  ]
  // Missing: dimensions: ["retailers.name"] ← This is required!
};
```

### ✅ Right Way (Will Match Pre-Aggregations)
```javascript
// This query WILL match pre-aggregations
const query = {
  dimensions: ["retailers.name"], // ← Include filtered dimension!
  measures: ["prices.averageRetailPrice"],
  timeDimensions: [{
    dimension: "prices.price_date",
    granularity: "day",
    dateRange: "Last 30 days"
  }],
  filters: [
    { member: "retailers.name", operator: "equals", values: ["Kaufland"] }
  ]
};
```

## 🛠️ Practical Implementation

### Example 1: Trend Chart with Filters
```typescript
// In your TrendChart component
import { buildOptimizedQuery } from "@/utils/cube/filterUtils";

export function TrendChart({ globalFilters }: { globalFilters: GlobalFilters }) {
  const query = buildOptimizedQuery(
    ["prices.averageRetailPrice", "prices.averagePromoPrice"],
    globalFilters
  );
  
  const { resultSet, isLoading } = useCubeQuery(query);
  
  // This will automatically match the right pre-aggregation based on active filters
}
```

### Example 2: Retailer Comparison Chart
```typescript
// Always include retailers dimension for retailer charts
export function RetailerChart({ globalFilters }: { globalFilters: GlobalFilters }) {
  const query = {
    dimensions: [
      "retailers.name", // Always include for retailer charts
      ...buildDimensions(globalFilters) // Include other filtered dimensions
    ],
    measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
    timeDimensions: buildTimeDimensions(globalFilters.dateRange),
    filters: buildFilters(globalFilters)
  };
  
  const { resultSet, isLoading } = useCubeQuery(query);
}
```

### Example 3: Smart Query Builder
```typescript
// Automatically build the optimal query for any filter combination
function useSmartQuery(measures: string[], globalFilters: GlobalFilters) {
  const query = useMemo(() => {
    const dimensions = buildDimensions(globalFilters);
    const expectedPreAgg = predictPreAggregationMatch(globalFilters);
    
    console.log(`Expected to match: ${expectedPreAgg}`);
    
    return {
      measures,
      dimensions,
      timeDimensions: buildTimeDimensions(globalFilters.dateRange),
      filters: buildFilters(globalFilters),
      order: { "prices.price_date": "asc" }
    };
  }, [measures, globalFilters]);
  
  return useCubeQuery(query);
}
```

## 🧪 Testing Your Implementation

### Step 1: Test Filter Combinations
Use the Pre-Aggregation Test component to verify:

1. **No Filters** → Should match `time_only_filtered` (< 500ms)
2. **Retailer Filter** → Should match `retailer_only_filtered` (< 500ms)
3. **Location Filter** → Should match `location_only_filtered` (< 500ms)
4. **Category Filter** → Should match `category_only_filtered` (< 500ms)
5. **Multiple Filters** → Should match appropriate combination pre-aggregation (< 500ms)

### Step 2: Verify Real Charts
Update your actual chart components to use the filter utilities:

```typescript
// Before (slow, no pre-aggregation matching)
const query = {
  measures: ["prices.averageRetailPrice"],
  filters: buildFilters(globalFilters) // Missing dimensions!
};

// After (fast, matches pre-aggregations)
const query = buildOptimizedQuery(
  ["prices.averageRetailPrice"],
  globalFilters
);
```

## 📊 Performance Expectations

### With Proper Filter Implementation:
- **No filters**: 50-200ms (time_only_filtered)
- **Single filter**: 100-300ms (specific filtered pre-agg)
- **Multiple filters**: 200-500ms (combination pre-agg)
- **All filters**: 300-600ms (universal_filtered)

### Without Proper Implementation:
- **Any filters**: 2-15 seconds (querying source database)

## 🎯 Filter Strategy Recommendations

### Option 1: Always Include All Dimensions (Simplest)
```typescript
// Always include all possible filter dimensions
const query = {
  dimensions: ["retailers.name", "settlements.name_bg", "category_groups.name"],
  measures: ["prices.averageRetailPrice"],
  timeDimensions: buildTimeDimensions(globalFilters.dateRange),
  filters: buildFilters(globalFilters)
};
// Will always match universal_filtered pre-aggregation
```

### Option 2: Dynamic Dimensions (Most Efficient)
```typescript
// Only include dimensions for active filters
const query = buildOptimizedQuery(
  ["prices.averageRetailPrice"],
  globalFilters
);
// Will match the most specific pre-aggregation available
```

## 🔧 Time Filter Flexibility

The good news about time filters: **any date range will work** as long as granularity matches!

```javascript
// All of these will match the same pre-aggregation (granularity: 'day')
dateRange: "Last 7 days"     ✅
dateRange: "Last 30 days"    ✅
dateRange: "Last 90 days"    ✅
dateRange: "This month"      ✅
dateRange: ["2025-01-01", "2025-01-31"]  ✅

// But this won't match (different granularity)
granularity: "week"  ❌ (if pre-agg uses 'day')
```

## 🚀 Next Steps

1. **Deploy** the updated `model/prices.js` with filtered pre-aggregations
2. **Test** the filter combinations in Pre-Aggregation Test
3. **Update** your chart components to use `buildOptimizedQuery`
4. **Verify** that all filtered queries are fast (< 500ms)
5. **Monitor** performance in production

The key insight: **filters are fast when you include filtered dimensions in your query dimensions!**