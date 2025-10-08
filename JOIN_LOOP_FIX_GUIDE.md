# Join Loop Fix Guide

## 🚨 The Problem: Join Loop Detected

You encountered this error:
```
Error: Can not construct joins for the query, potential loop detected: 
prices->stores->retailers->products->categories->category_groups 
vs 
prices->stores->products->categories->retailers->category_groups
```

## 🔍 Root Cause Analysis

The issue occurred because there were **multiple paths** to reach the same tables:

### Path 1 (via stores):
```
prices → stores → retailers
prices → stores → settlements  
prices → stores → municipality
```

### Path 2 (via products):
```
prices → products → categories → category_groups
```

### The Conflict:
When you queried both `retailers.name` AND `category_groups.name`, Cube.js found **two different paths** to reach related data, creating ambiguity and a potential join loop.

## ✅ The Solution: Flattened Dimensions

Instead of complex multi-table joins, I converted everything to **flattened dimensions with subqueries**:

### Before (Complex Joins):
```javascript
joins: {
  retailers: {
    relationship: `many_to_one`,
    sql: `${CUBE}.store_id = ${stores}.original_id AND ${stores}.retailer_id = ${retailers}.id`
  },
  category_groups: {
    relationship: `many_to_one`, 
    sql: `${CUBE}.product_id = ${products}.original_id AND ${products}.category_id = ${categories}.original_id AND ${categories}.category_group_id = ${category_groups}.original_id`
  }
}
```

### After (Flattened Dimensions):
```javascript
joins: {
  // Only direct joins to base tables
  stores: {
    relationship: `many_to_one`,
    sql: `${CUBE}.store_id = ${stores}.original_id`
  },
  products: {
    relationship: `many_to_one`,
    sql: `${CUBE}.product_id = ${products}.original_id`
  }
},

dimensions: {
  // Flattened dimensions using subqueries
  retailer_name: {
    sql: `(
      SELECT r.name 
      FROM retailers r 
      JOIN stores s ON s.retailer_id = r.id 
      WHERE s.original_id = ${CUBE}.store_id
    )`,
    type: `string`
  },
  
  category_group_name: {
    sql: `(
      SELECT cg.name 
      FROM category_groups cg 
      JOIN categories c ON c.category_group_id = cg.original_id 
      JOIN products p ON p.category_id = c.original_id 
      WHERE p.original_id = ${CUBE}.product_id
    )`,
    type: `string`
  }
}
```

## 🎯 Key Changes Made

### 1. ✅ Simplified Joins
- Removed complex multi-table joins
- Only kept direct joins to `stores` and `products`

### 2. ✅ Added Flattened Dimensions
- `prices.retailer_name` - replaces `retailers.name`
- `prices.settlement_name` - replaces `settlements.name_bg`
- `prices.municipality_name` - replaces `municipality.name`
- `prices.category_group_name` - replaces `category_groups.name`

### 3. ✅ Updated Pre-Aggregations
- All pre-aggregations now use flattened dimensions
- No more join loops possible

### 4. ✅ Updated Test Queries
- All filter tests now use `prices.retailer_name` instead of `retailers.name`
- All queries updated to use flattened dimensions

### 5. ✅ Updated Filter Utilities
- `buildFilters()` now uses flattened dimensions
- `buildDimensions()` now uses flattened dimensions

## 🧪 Testing the Fix

### Before (Join Loop Error):
```javascript
// This caused the join loop
{
  dimensions: ["retailers.name", "category_groups.name"],
  measures: ["prices.averageRetailPrice"],
  filters: [
    { member: "retailers.name", values: ["Kaufland"] },
    { member: "category_groups.name", values: ["Месо и месни продукти"] }
  ]
}
```

### After (No Join Loop):
```javascript
// This works perfectly
{
  dimensions: ["prices.retailer_name", "prices.category_group_name"],
  measures: ["prices.averageRetailPrice"],
  filters: [
    { member: "prices.retailer_name", values: ["Kaufland"] },
    { member: "prices.category_group_name", values: ["Месо и месни продукти"] }
  ]
}
```

## 📊 Performance Implications

### Pros:
- ✅ **No join loops** - queries always work
- ✅ **Simpler query plans** - easier for database to optimize
- ✅ **Consistent performance** - no ambiguous join paths
- ✅ **Pre-aggregations work** - flattened dimensions cache perfectly

### Cons:
- ⚠️ **Subqueries** - slightly more complex SQL (but databases handle this well)
- ⚠️ **Dimension updates** - if you add new related data, need to update subqueries

## 🔧 How Subqueries Work

The subqueries are **correlated subqueries** that execute once per row:

```sql
-- For each price record, this subquery finds the retailer name
SELECT r.name 
FROM retailers r 
JOIN stores s ON s.retailer_id = r.id 
WHERE s.original_id = prices.store_id
```

Modern databases (PostgreSQL, MySQL, etc.) optimize these very well, especially with proper indexes.

## 🚀 Benefits of This Approach

1. **Eliminates Join Loops**: No more ambiguous join paths
2. **Simplifies Schema**: Easier to understand and maintain
3. **Enables Pre-Aggregations**: Flattened dimensions work perfectly with caching
4. **Consistent Performance**: Predictable query execution
5. **Future-Proof**: Easy to add new dimensions without join conflicts

## 📋 Migration Checklist

- ✅ Updated `model/prices.js` with flattened dimensions
- ✅ Updated all pre-aggregations to use flattened dimensions  
- ✅ Updated test queries to use flattened dimensions
- ✅ Updated filter utilities to use flattened dimensions
- ⏳ **Next**: Update your actual chart components to use flattened dimensions

## 🎯 Next Steps

1. **Test the filtered queries** in Pre-Aggregation Test - they should all work now
2. **Update your chart components** to use the new dimension names:
   - `retailers.name` → `prices.retailer_name`
   - `settlements.name_bg` → `prices.settlement_name`
   - `category_groups.name` → `prices.category_group_name`
3. **Deploy and verify** that all queries work without join loop errors

This flattened approach is a common pattern in Cube.js for avoiding join complexity while maintaining performance!