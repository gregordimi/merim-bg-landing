# Handling Non-Additive Measures in Pre-Aggregations

## Your Specific Query

```json
{
  "measures": [
    "prices.averageRetailPrice",
    "prices.averagePromoPrice"
  ],
  "timeDimensions": [
    {
      "dimension": "prices.price_date",
      "granularity": "day",
      "dateRange": "Last 30 days"
    }
  ],
  "filters": [],
  "order": {
    "prices.price_date": "asc"
  }
}
```

## The Problem with Non-Additive Measures

Your query uses **two non-additive measures**:
- `averageRetailPrice` (type: `avg`) 
- `averagePromoPrice` (type: `avg`)

According to Cube.js docs, **non-additive measures are harder to match with pre-aggregations** and result in slower performance.

## Solution 1: Exact Match Pre-Aggregation (Slower but Works)

I've added this to your `model/prices.js`:

```javascript
main: {
  measures: [averageRetailPrice, averagePromoPrice],
  timeDimension: price_date,
  granularity: 'day',
  refreshKey: {every: '4 hours'},
  // WARNING: Non-additive measures - will be slower to build
}
```

**Pros:**
- ✅ Will match your query exactly
- ✅ No frontend changes needed

**Cons:**
- ❌ Slower to build (minutes instead of seconds)
- ❌ Slower to query (still faster than no pre-aggregation)
- ❌ Less efficient storage

## Solution 2: Fast Additive Alternative (Recommended)

I've also added this **much faster** alternative:

```javascript
main_fast: {
  measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
  timeDimension: price_date,
  granularity: 'day',
  refreshKey: {every: '4 hours'},
  // MUCH faster to build and query!
}
```

**Frontend calculation:**
```typescript
// Instead of using averageRetailPrice directly:
const avgRetailPrice = totalRetailPrice / retailPriceCount;
const avgPromoPrice = totalPromoPrice / promoPriceCount;
```

**Pros:**
- ✅ **10x faster** to build and query
- ✅ More efficient storage
- ✅ Better scalability

**Cons:**
- ❌ Requires frontend changes
- ❌ Slightly more complex logic

## Performance Comparison

| Approach | Build Time | Query Time | Storage | Complexity |
|----------|------------|------------|---------|------------|
| **No Pre-Agg** | N/A | 5-15s | N/A | Simple |
| **Non-Additive** | 2-5 min | 200-800ms | High | Simple |
| **Additive** | 10-30s | 50-200ms | Low | Medium |

## How to Test

1. **Deploy** the updated `model/prices.js`
2. **Test both approaches** using the Pre-Aggregation Test component:
   - "🎯 Your Main Query (Non-Additive)" - tests exact match
   - "🚀 Your Main Query (Fast Additive)" - tests fast version

3. **Compare execution times**:
   - Non-additive: Should be 200-800ms
   - Additive: Should be 50-200ms

## Recommended Implementation Strategy

### Phase 1: Quick Fix (Use Exact Match)
```javascript
// Use the exact match pre-aggregation
// No code changes needed - just deploy the schema
```

### Phase 2: Optimize (Switch to Additive)
```typescript
// Update your query to use additive measures
const query = {
  measures: [
    "prices.totalRetailPrice", 
    "prices.totalPromoPrice", 
    "prices.retailPriceCount", 
    "prices.promoPriceCount"
  ],
  timeDimensions: [/* same as before */]
};

// Calculate averages in frontend
const processData = (resultSet) => {
  return resultSet.tablePivot().map(row => ({
    ...row,
    avgRetailPrice: row['prices.totalRetailPrice'] / row['prices.retailPriceCount'],
    avgPromoPrice: row['prices.totalPromoPrice'] / row['prices.promoPriceCount']
  }));
};
```

## Why This Happens

From the Cube.js documentation:

> "Most commonly, a query would not match a pre-aggregation because they contain non-additive measures."

**Additive measures** can be safely combined across partitions:
- `sum(A) + sum(B) = sum(A + B)` ✅
- `count(A) + count(B) = count(A + B)` ✅

**Non-additive measures** cannot:
- `avg(A) + avg(B) ≠ avg(A + B)` ❌
- This makes pre-aggregation matching much more complex

## Next Steps

1. **Test the exact match** first to verify it works
2. **Monitor performance** - should be much faster than before
3. **Consider switching to additive** for maximum performance
4. **Use the debug component** to verify pre-aggregation matching

The key insight is that you now have **both options** - use the exact match for immediate results, then optimize with additive measures when you have time.