# Filters and Pre-Aggregations Guide

## 🎯 The Filter Challenge

You want to filter by:
- **Retailer** (`retailers.name`)
- **Location** (`settlements.name_bg` or `municipality.name`)
- **Category** (`category_groups.name`)
- **Time** (`prices.price_date`)

## 📋 Cube.js Filter Rules for Pre-Aggregations

From the documentation:
> "Are query filter dimensions included in its own dimensions? Cube checks that all filter dimensions are also included as dimensions in the query."

### ❌ This Won't Match Pre-Aggregations
```javascript
// Query with filters
{
  measures: ["prices.averageRetailPrice"],
  filters: [
    { member: "retailers.name", operator: "equals", values: ["Kaufland"] }
  ],
  // retailers.name is NOT in dimensions - won't match pre-agg!
}

// Pre-aggregation
{
  measures: [averageRetailPrice],
  timeDimension: price_date,
  granularity: 'day'
  // No retailers.name dimension - won't match filtered query
}
```

### ✅ This Will Match Pre-Aggregations
```javascript
// Query with filters
{
  dimensions: ["retailers.name"],  // ← Include filtered dimension!
  measures: ["prices.averageRetailPrice"],
  filters: [
    { member: "retailers.name", operator: "equals", values: ["Kaufland"] }
  ]
}

// Pre-aggregation
{
  measures: [averageRetailPrice],
  dimensions: [retailers.name],  // ← Include filtered dimension!
  timeDimension: price_date,
  granularity: 'day'
}
```

## 🛠️ Solution Strategy

### Option 1: Multi-Dimensional Pre-Aggregations (Recommended)
Create pre-aggregations that include ALL possible filter dimensions:

```javascript
// Universal pre-aggregation for all filters
universal_filtered: {
  measures: [averageRetailPrice, averagePromoPrice],
  dimensions: [
    retailers.name,        // For retailer filters
    settlements.name_bg,   // For location filters  
    category_groups.name   // For category filters
  ],
  timeDimension: price_date,
  granularity: 'day',
  refreshKey: {every: '4 hours'}
}
```

### Option 2: Specific Filter Combinations
Create pre-aggregations for common filter combinations:

```javascript
// Retailer + Category filtering
retailer_category_filtered: {
  measures: [averageRetailPrice, averagePromoPrice],
  dimensions: [retailers.name, category_groups.name],
  timeDimension: price_date,
  granularity: 'day'
},

// Location + Category filtering  
location_category_filtered: {
  measures: [averageRetailPrice, averagePromoPrice],
  dimensions: [settlements.name_bg, category_groups.name],
  timeDimension: price_date,
  granularity: 'day'
}
```

## 🎯 Frontend Query Patterns

### Pattern 1: Always Include Filter Dimensions
```javascript
const buildQuery = (filters) => {
  const dimensions = [];
  
  // Add dimensions for any applied filters
  if (filters.retailers?.length > 0) {
    dimensions.push("retailers.name");
  }
  if (filters.locations?.length > 0) {
    dimensions.push("settlements.name_bg");
  }
  if (filters.categories?.length > 0) {
    dimensions.push("category_groups.name");
  }
  
  return {
    dimensions,
    measures: ["prices.averageRetailPrice"],
    timeDimensions: [{
      dimension: "prices.price_date",
      granularity: "day",
      dateRange: filters.dateRange || "Last 30 days"
    }],
    filters: buildFilters(filters)
  };
};
```

### Pattern 2: Fixed Dimensions (Simpler)
```javascript
// Always include all possible filter dimensions
const query = {
  dimensions: [
    "retailers.name",
    "settlements.name_bg", 
    "category_groups.name"
  ],
  measures: ["prices.averageRetailPrice"],
  timeDimensions: [{
    dimension: "prices.price_date",
    granularity: "day",
    dateRange: "Last 30 days"
  }],
  filters: buildFilters(globalFilters)
};
```

## ⏰ Time Filter Considerations

### Date Range Flexibility
```javascript
// These will all match the same pre-aggregation (granularity: 'day')
dateRange: "Last 7 days"    ✅
dateRange: "Last 30 days"   ✅  
dateRange: "Last 90 days"   ✅
dateRange: ["2025-01-01", "2025-01-31"]  ✅

// But this won't match (different granularity)
granularity: "week"  ❌ (if pre-agg uses 'day')
```

### Recommended Time Approach
```javascript
// Use consistent granularity across all queries
timeDimensions: [{
  dimension: "prices.price_date",
  granularity: "day",  // Always use 'day' for consistency
  dateRange: userSelectedDateRange || "Last 30 days"
}]
```

## 🚀 Performance Optimization Tips

### 1. Limit Filter Combinations
```javascript
// ✅ Good - specific combinations
retailer_time_only: {
  dimensions: [retailers.name],
  measures: [averageRetailPrice],
  timeDimension: price_date,
  granularity: 'day'
}

// ❌ Expensive - too many dimensions
everything_filtered: {
  dimensions: [retailers.name, settlements.name_bg, category_groups.name, stores.name],
  measures: [averageRetailPrice],
  timeDimension: price_date,
  granularity: 'day'
}
```

### 2. Use Indexes for Large Pre-Aggregations
```javascript
universal_filtered: {
  measures: [averageRetailPrice],
  dimensions: [retailers.name, settlements.name_bg, category_groups.name],
  timeDimension: price_date,
  granularity: 'day',
  
  // Add indexes for common filter patterns
  indexes: {
    retailer_time_index: {
      columns: [retailers.name, price_date]
    },
    location_time_index: {
      columns: [settlements.name_bg, price_date]  
    }
  }
}
```

## 🧪 Testing Strategy

1. **Start Simple**: Test with one filter type at a time
2. **Add Dimensions**: Ensure filtered dimensions are included in query dimensions
3. **Verify Matching**: Use debug tools to confirm pre-aggregation matching
4. **Measure Performance**: Ensure filtered queries are still fast (< 500ms)

## 📝 Next Steps

1. **Choose your approach** (universal vs specific pre-aggregations)
2. **Update your pre-aggregations** to include filter dimensions
3. **Modify frontend queries** to include filtered dimensions
4. **Test with the Pre-Aggregation Test component**
5. **Monitor performance** with real filter combinations