# Pre-Aggregation Matching Guide

## Current Problem

Your queries are not matching pre-aggregations because of these issues:

### 1. Non-Additive Measures
```javascript
// ❌ SLOW - Non-additive measure
measures: ["prices.averageRetailPrice"]

// ✅ FAST - Additive measures  
measures: ["prices.totalRetailPrice", "prices.retailPriceCount"]
// Frontend calculates: totalRetailPrice / retailPriceCount = average
```

### 2. Exact Matching Requirements

For a query to match a pre-aggregation, **ALL** of these must match exactly:

```javascript
// Query:
{
  dimensions: ["retailers.name"],
  measures: ["prices.averageRetailPrice"],
  timeDimensions: [{
    dimension: "prices.price_date",
    granularity: "day",
    dateRange: "Last 30 days"
  }]
}

// Pre-aggregation MUST have:
{
  measures: [averageRetailPrice],        // ✅ Exact match
  dimensions: [retailers.name],          // ✅ Exact match  
  timeDimension: price_date,             // ✅ Exact match
  granularity: 'day'                     // ✅ Exact match
}
```

## Solution 1: Exact Match Pre-Aggregations

I've added these to your `model/prices.js`:

```javascript
// EXACT match for retailer chart
retailer_chart_match: {
  measures: [averageRetailPrice],
  dimensions: [retailers.name],
  timeDimension: price_date,
  granularity: 'day',
  refreshKey: {every: '4 hours'}
},

// EXACT match for category chart  
category_chart_match: {
  measures: [averageRetailPrice],
  dimensions: [category_groups.name],
  timeDimension: price_date,
  granularity: 'day',
  refreshKey: {every: '4 hours'}
}
```

## Solution 2: Fast Additive Pre-Aggregations

For better performance, use additive measures:

```javascript
// Fast retailer aggregation
retailer_additive: {
  measures: [totalRetailPrice, retailPriceCount],
  dimensions: [retailers.name],
  timeDimension: price_date,
  granularity: 'day',
  refreshKey: {every: '4 hours'}
}
```

Then in your frontend, calculate the average:
```typescript
const average = totalRetailPrice / retailPriceCount;
```

## How to Test Pre-Aggregation Matching

### 1. Enable Debug Mode
Add this to your Cube.js config:
```javascript
module.exports = {
  // ... other config
  devMode: true,
  logger: (msg, params) => {
    console.log(`${msg}: ${JSON.stringify(params)}`);
  }
};
```

### 2. Check Cube Store Logs
Look for these messages:
```
✅ "Pre-aggregation matched: retailer_chart_match"
❌ "No matching pre-aggregation found, querying source"
```

### 3. Use the Debug Utility
The QueryRenderer now logs query analysis in development mode.

## Common Matching Issues

### Issue 1: Time Zone Mismatch
```javascript
// Query uses: "Last 30 days" 
// Pre-aggregation built in: UTC
// Solution: Ensure consistent time zones
```

### Issue 2: Filter Dimensions Not Included
```javascript
// ❌ Query has filter on retailers.name but pre-agg doesn't include it as dimension
filters: [{ member: "retailers.name", operator: "equals", values: ["Kaufland"] }]

// ✅ Pre-aggregation must include filtered dimensions
dimensions: [retailers.name]  // Include filtered dimension
```

### Issue 3: Granularity Mismatch
```javascript
// ❌ Query: granularity: "day", Pre-agg: granularity: "hour"
// ✅ Must match exactly: both "day" or both "hour"
```

## Testing Your Setup

1. **Check Current Queries**: Open browser dev tools and look for the debug logs
2. **Verify Pre-Aggregations**: Check if they're being built in Cube Store
3. **Monitor Performance**: Fast queries (< 100ms) likely use pre-aggregations

## Next Steps

1. Deploy the updated `model/prices.js` with exact match pre-aggregations
2. Test your charts - they should be much faster now
3. Consider switching to additive measures for even better performance
4. Monitor the debug logs to confirm matching

## Performance Expectations

- **Without pre-aggregations**: 2-10 seconds
- **With exact match pre-aggregations**: 100-500ms  
- **With additive pre-aggregations**: 50-200ms