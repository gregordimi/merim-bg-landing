# Time Filter Guide - How Time Filtering Works in Cube.js

## 🕒 How Time Filters Work

Time filters in Cube.js are **special** - they work differently from regular dimension filters and have unique pre-aggregation matching behavior.

## 📋 Time Filter vs Regular Filters

### Regular Filters (Retailer, Location, Category)
```javascript
// Regular filters require the filtered dimension to be included in dimensions
{
  dimensions: ["prices.retailer_name"], // ← MUST include filtered dimension
  filters: [
    { member: "prices.retailer_name", operator: "equals", values: ["Kaufland"] }
  ]
}
```

### Time Filters (Special Behavior)
```javascript
// Time filters DON'T need to be included in dimensions
{
  dimensions: ["prices.retailer_name"], // ← Time dimension NOT required here
  timeDimensions: [
    {
      dimension: "prices.price_date",
      granularity: "day",
      dateRange: "Last 30 days" // ← This is the time filter
    }
  ]
}
```

## 🎯 Key Time Filter Concepts

### 1. **Time Dimensions vs Filters**
- **timeDimensions**: Define the time axis and granularity
- **dateRange**: Acts as the time filter (what data to include)

### 2. **Granularity is Critical**
```javascript
// These will match DIFFERENT pre-aggregations
granularity: "day"    // Matches pre-aggs with granularity: 'day'
granularity: "week"   // Matches pre-aggs with granularity: 'week'  
granularity: "month"  // Matches pre-aggs with granularity: 'month'
```

### 3. **Date Range Flexibility**
```javascript
// All of these will match the SAME pre-aggregation (if granularity matches)
dateRange: "Last 7 days"
dateRange: "Last 30 days"
dateRange: "Last 90 days"
dateRange: "This month"
dateRange: "This year"
dateRange: ["2024-01-01", "2024-01-31"]  // Custom range
```

## 🔍 Time Filter Matching Rules

### ✅ What Matches Pre-Aggregations
1. **Granularity must match exactly**: `day` query → `day` pre-agg
2. **Date range can be anything**: Any date range works with same granularity
3. **Time zone must match**: Usually UTC (default)

### ❌ What Breaks Pre-Aggregation Matching
1. **Granularity mismatch**: `day` query → `week` pre-agg ❌
2. **Missing granularity**: `undefined` granularity ❌
3. **Time zone mismatch**: Query in EST, pre-agg in UTC ❌

## 📊 Time Filter Examples

### Example 1: Flexible Date Ranges
```javascript
// Pre-aggregation definition
{
  measures: [averageRetailPrice],
  timeDimension: price_date,
  granularity: 'day'  // ← Key: granularity is 'day'
}

// All these queries will match the same pre-aggregation
Query1: { timeDimensions: [{ dimension: "prices.price_date", granularity: "day", dateRange: "Last 7 days" }] }   ✅
Query2: { timeDimensions: [{ dimension: "prices.price_date", granularity: "day", dateRange: "Last 30 days" }] }  ✅
Query3: { timeDimensions: [{ dimension: "prices.price_date", granularity: "day", dateRange: "Last 90 days" }] }  ✅
Query4: { timeDimensions: [{ dimension: "prices.price_date", granularity: "day", dateRange: ["2024-01-01", "2024-12-31"] }] } ✅
```

### Example 2: Granularity Matters
```javascript
// Different granularities need different pre-aggregations
daily_pre_agg: { granularity: 'day' }     // Matches granularity: "day" queries
weekly_pre_agg: { granularity: 'week' }   // Matches granularity: "week" queries
monthly_pre_agg: { granularity: 'month' } // Matches granularity: "month" queries
```

## 🚀 Performance Implications

### Fast Time Filtering (Uses Pre-Aggregations)
```javascript
// This is FAST because it matches pre-aggregations
{
  timeDimensions: [{
    dimension: "prices.price_date",
    granularity: "day",        // ← Matches pre-agg granularity
    dateRange: "Last 30 days"  // ← Any range works
  }]
}
```

### Slow Time Filtering (No Pre-Aggregation Match)
```javascript
// This is SLOW because granularity doesn't match any pre-agg
{
  timeDimensions: [{
    dimension: "prices.price_date", 
    granularity: "hour",       // ← No pre-agg with 'hour' granularity
    dateRange: "Last 30 days"
  }]
}
```

## 🎯 Time Filter Strategy

### Option 1: Single Granularity (Recommended)
Use `day` granularity for everything:
```javascript
// All queries use 'day' granularity
timeDimensions: [{
  dimension: "prices.price_date",
  granularity: "day",  // ← Consistent across all queries
  dateRange: userSelectedRange
}]
```

**Pros**: Simple, all queries match pre-aggregations
**Cons**: Less flexibility for different time views

### Option 2: Multiple Granularities
Create pre-aggregations for different granularities:
```javascript
// Pre-aggregations for different time views
daily_data: { granularity: 'day' }     // For detailed views
weekly_data: { granularity: 'week' }   // For weekly summaries  
monthly_data: { granularity: 'month' } // For long-term trends
```

**Pros**: Optimized for different use cases
**Cons**: More pre-aggregations to maintain

## 🔧 Time Filter Implementation

### Building Time Dimensions
```javascript
export function buildTimeDimensions(dateRange?: string[], granularity = "day") {
  return [
    {
      dimension: "prices.price_date",
      granularity: granularity as const,
      dateRange: dateRange || "Last 30 days",
    },
  ];
}
```

### Common Date Range Patterns
```javascript
const DATE_RANGES = {
  last7Days: "Last 7 days",
  last30Days: "Last 30 days", 
  last90Days: "Last 90 days",
  thisMonth: "This month",
  lastMonth: "Last month",
  thisYear: "This year",
  custom: ["2024-01-01", "2024-01-31"]
};
```

## 🧪 Testing Time Filters

Time filters should be tested with:
1. **Different date ranges** (same granularity)
2. **Different granularities** (if you have multiple pre-aggs)
3. **Custom date ranges** vs predefined ranges
4. **Edge cases** (very short/long ranges)

## 💡 Key Insights

1. **Time filters are flexible** - any date range works with matching granularity
2. **Granularity is the key** - must match pre-aggregation exactly
3. **Date range doesn't affect matching** - only granularity matters
4. **Time filters don't need dimensions** - unlike regular filters
5. **Performance is predictable** - based on granularity matching, not date range size

This makes time filtering very powerful - you can have dynamic date ranges while maintaining consistent pre-aggregation performance!