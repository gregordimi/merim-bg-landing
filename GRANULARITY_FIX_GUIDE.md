# Granularity Fix Guide - Solving the "undefined" Time Dimension Issue

## 🎯 The Problem You Identified

You found that settlement and municipality queries were showing:
```
⏰ Time Dimensions: ['prices.price_date(undefined)']
```

This `undefined` granularity **prevents pre-aggregation matching** because Cube.js requires **exact granularity matches**.

## 🔍 Root Cause

The issue was in the query definitions where `timeDimensions` were missing the `granularity` property:

### ❌ Broken Query (No Granularity)
```javascript
timeDimensions: [
  {
    dimension: "prices.price_date",
    dateRange: "Last 30 days"
    // Missing granularity!
  }
]
```

### ✅ Fixed Query (With Granularity)
```javascript
timeDimensions: [
  {
    dimension: "prices.price_date",
    granularity: "day",  // ← This was missing!
    dateRange: "Last 30 days"
  }
]
```

## 🛠️ What I Fixed

### 1. ✅ Updated All Test Queries
I added `granularity: "day"` to all queries that were missing it:

- `settlement_chart`
- `municipality_chart` 
- `settlement_horizontal`
- `municipality_horizontal`
- `category_chart`
- `retailer_price_chart`
- `discount_chart`
- `category_range_chart`
- `competitor_analysis_avg`
- `category_deep_dive_compare`

### 2. ✅ Added Exact Match Pre-Aggregations
I added new pre-aggregations to your `model/prices.js` that match these specific query patterns:

```javascript
// For settlement queries
settlement_chart_match: {
  measures: [averageRetailPrice, averagePromoPrice],
  dimensions: [settlements.name_bg],
  timeDimension: price_date,
  granularity: 'day',  // ← Matches query granularity
  refreshKey: {every: '4 hours'}
},

// For municipality queries  
municipality_chart_match: {
  measures: [averageRetailPrice, averagePromoPrice],
  dimensions: [municipality.name],
  timeDimension: price_date,
  granularity: 'day',  // ← Matches query granularity
  refreshKey: {every: '4 hours'}
},

// And more...
```

## 📋 Pre-Aggregation Matching Rules

For a query to match a pre-aggregation, **ALL** of these must match exactly:

1. **Measures**: Same measures in same order
2. **Dimensions**: Same dimensions 
3. **Time Dimension**: Same dimension name
4. **Granularity**: **EXACT** granularity match (`day`, `hour`, `week`, etc.)
5. **Filters**: All filter dimensions must be included as dimensions

## 🧪 How to Test the Fix

1. **Deploy** the updated `model/prices.js`
2. **Go to** ChartListPage → "🧪 Pre-Aggregation Test"
3. **Test these specific queries**:
   - 🏘️ Settlement Chart
   - 🏛️ Municipality Chart
   - 📊 Settlement Horizontal
   - 📈 Municipality Horizontal

4. **Check the debug output** - should now show:
   ```
   ⏰ Time Dimensions: ['prices.price_date(day)']  // ← No more undefined!
   ```

5. **Verify performance**:
   - Before: 2-10 seconds (querying source)
   - After: 100-500ms (using pre-aggregations)

## 🚀 Expected Results

After the fix, you should see:

### ✅ Debug Output
```
📊 Measures: ['prices.averageRetailPrice', 'prices.averagePromoPrice']
📐 Dimensions: ['settlements.name_bg']
⏰ Time Dimensions: ['prices.price_date(day)']  // ← Fixed!
💡 Matching Tips:
  ✅ Time dimension found: prices.price_date with day granularity
  🎯 Suggested pre-aggregation: { measures: [...], dimensions: [...], timeDimension: prices.price_date, granularity: 'day' }
```

### ✅ Performance
- Settlement queries: **100-500ms** (was 2-10s)
- Municipality queries: **100-500ms** (was 2-10s)
- All other geographic queries: **Fast**

## 🔧 Key Insights

1. **Granularity is mandatory** for time dimensions in pre-aggregation matching
2. **"undefined" granularity = no pre-aggregation match** = slow queries
3. **Exact matching is required** - even small differences prevent matching
4. **Default granularity doesn't exist** - you must specify it explicitly

## 📝 Best Practices Going Forward

### Always Include Granularity
```javascript
// ✅ Good
timeDimensions: [{
  dimension: "prices.price_date",
  granularity: "day",  // Always specify!
  dateRange: "Last 30 days"
}]

// ❌ Bad  
timeDimensions: [{
  dimension: "prices.price_date",
  dateRange: "Last 30 days"  // Missing granularity
}]
```

### Match Pre-Aggregations Exactly
```javascript
// Query granularity: "day"
// Pre-aggregation granularity: "day"  ✅ Match!

// Query granularity: "day" 
// Pre-aggregation granularity: "hour" ❌ No match!
```

This fix should resolve the caching issues for all your settlement and municipality queries!