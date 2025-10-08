# Cube.js Cache Analysis - Why Some Queries Are Cached and Others Aren't

## 🔍 Analysis of Current Situation

Based on the screenshots, I can see:
- Many queries are getting cached (REST status)
- But the queries you actually need are not hitting cache
- There's a pattern to what's getting cached vs what's not

## 📊 Cached Queries (From Screenshots)

### Pattern 1: Simple Aggregations (CACHED ✅)
```json
{
  "measures": ["prices.averageRetailPrice", "prices.averagePromoPrice"],
  "timeDimensions": [{"dimension": "prices.price_date", "granularity": "day"}]
}
```
**Why cached**: Matches `daily_totals` or similar pre-aggregation

### Pattern 2: Category Queries (CACHED ✅)
```json
{
  "measures": ["prices.averageRetailPrice", "prices.averagePromoPrice"],
  "dimensions": ["category_groups.name"],
  "timeDimensions": [{"dimension": "prices.price_date", "granularity": "day"}]
}
```
**Why cached**: Matches `category_totals` pre-aggregation

### Pattern 3: Settlement Queries (CACHED ✅)
```json
{
  "measures": ["prices.averageRetailPrice", "prices.averagePromoPrice"],
  "dimensions": ["settlements.name_bg"],
  "timeDimensions": [{"dimension": "prices.price_date", "granularity": "day"}]
}
```
**Why cached**: Matches `price_by_settlement` pre-aggregation

## ❌ NOT CACHED Queries (Your Charts)

### Municipality Queries (NOT CACHED ❌)
```json
{
  "measures": ["prices.averageRetailPrice", "prices.averagePromoPrice"],
  "dimensions": ["municipality.name"],
  "timeDimensions": [{"dimension": "prices.price_date", "granularity": "day"}]
}
```
**Why NOT cached**: No matching pre-aggregation for `municipality.name`

### Retailer Queries (NOT CACHED ❌)
```json
{
  "measures": ["prices.averageRetailPrice", "prices.averagePromoPrice"],
  "dimensions": ["retailers.name"],
  "timeDimensions": [{"dimension": "prices.price_date", "granularity": "day"}]
}
```
**Why NOT cached**: No matching pre-aggregation for `retailers.name`

### Stats Cards (NOT CACHED ❌)
```json
{
  "measures": ["prices.minRetailPrice", "prices.maxRetailPrice"],
  "timeDimensions": [{"dimension": "prices.price_date", "dateRange": "Last 30 days"}]
}
```
**Why NOT cached**: Uses `dateRange` instead of `granularity`

## 🎯 ROOT CAUSE ANALYSIS

### Issue 1: Missing Pre-aggregations
Your current pre-aggregations:
- ✅ `price_by_settlement` - Works
- ✅ `category_totals` - Works  
- ❌ `price_by_municipality` - Broken (join issue)
- ❌ No retailer pre-aggregation
- ❌ No stats pre-aggregation

### Issue 2: Query Pattern Mismatches
Your charts use different patterns than pre-aggregations:

**Chart Query**:
```json
"timeDimensions": [{"dimension": "prices.price_date", "dateRange": "Last 30 days"}]
```

**Pre-aggregation**:
```json
"timeDimension": "prices.price_date",
"granularity": "day"
```

### Issue 3: Join Problems
Municipality join is failing:
```
Error: 'municipality' not found for path 'prices.municipality'
```

## 🔧 SPECIFIC FIXES NEEDED

### Fix 1: Municipality Join Issue
The municipality join in your prices cube is broken. Need to debug:
1. Check if municipality cube exists
2. Verify join SQL syntax
3. Test join in isolation

### Fix 2: Add Missing Pre-aggregations
```javascript
// Add these to your prices cube:
retailer_stats: {
  measures: [averageRetailPrice, averagePromoPrice],
  dimensions: [retailers.name],
  timeDimension: price_date,
  granularity: 'day'
},

stats_summary: {
  measures: [minRetailPrice, maxRetailPrice],
  timeDimension: price_date,
  granularity: 'day'
}
```

### Fix 3: Standardize Time Dimensions
All your charts should use consistent time dimension patterns that match pre-aggregations.

## 🎯 NEXT STEPS

1. **Debug municipality join** - Find why it's failing
2. **Add missing pre-aggregations** for retailers and stats
3. **Standardize query patterns** across all charts
4. **Test each chart individually** to verify cache hits

## 📋 CHART-BY-CHART STATUS

| Chart | Current Status | Cache Hit | Issue |
|-------|---------------|-----------|-------|
| StatsCards | ❌ Not Cached | No | Missing pre-agg + dateRange vs granularity |
| TrendChart | ✅ Cached | Yes | Works with daily_totals |
| CategoryChart | ✅ Cached | Yes | Works with category_totals |
| SettlementChart | ✅ Cached | Yes | Works with price_by_settlement |
| MunicipalityChart | ❌ Not Cached | No | Broken municipality join |
| RetailerTrendChart | ❌ Not Cached | No | Missing retailer pre-agg |
| RetailerPriceChart | ❌ Not Cached | No | Missing retailer pre-agg |
| DiscountChart | ❌ Not Cached | No | Missing retailer pre-agg |

## 🚀 PRIORITY ORDER

1. **HIGH**: Fix municipality join (affects 2 charts)
2. **HIGH**: Add retailer pre-aggregation (affects 3 charts)  
3. **MEDIUM**: Fix stats cards time dimension pattern
4. **LOW**: Optimize existing working charts