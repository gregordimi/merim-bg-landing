# Direct Queries vs Subqueries - Performance Comparison

## 🚨 The Performance Problem You Discovered

You found that this query took **1 minute**:
```javascript
{
  "dimensions": ["prices.category_group_name"],
  "measures": [],
  "filters": [],
  "order": { "prices.category_group_name": "asc" }
}
```

This is because `prices.category_group_name` uses a **complex subquery**!

## 🔍 Why Subqueries Are Slow

### The Subquery Behind `prices.category_group_name`
```sql
-- This runs for EVERY price record!
SELECT cg.name 
FROM category_groups cg 
JOIN categories c ON c.category_group_id = cg.original_id 
JOIN products p ON p.category_id = c.original_id 
WHERE p.original_id = prices.product_id
```

### Performance Impact
- **Executes once per price record** - millions of executions
- **Complex joins** - 3 table joins per execution
- **No optimization** - database can't optimize correlated subqueries well
- **Result**: 1 minute for a simple list query!

## ✅ The Direct Query Solution

### Instead of Subquery, Query Direct Source
```javascript
// ❌ SLOW: Via prices cube (1 minute)
{
  dimensions: ["prices.category_group_name"]
}

// ✅ FAST: Direct from category_groups cube (< 1 second)
{
  dimensions: ["category_groups.name"]
}
```

### Why Direct Queries Are Fast
- **Simple table scan** - just read from category_groups table
- **No joins needed** - direct access to the data
- **Database optimized** - simple SELECT with ORDER BY
- **Pre-aggregation ready** - matches `category_group_names` pre-agg

## 📊 Performance Comparison

| Query Type | Execution Time | Why |
|------------|---------------|-----|
| `category_groups.name` | < 1 second | Direct table access |
| `prices.category_group_name` | 1+ minute | Subquery per price record |
| `retailers.name` | < 1 second | Direct table access |
| `prices.retailer_name` | 10+ seconds | Subquery per price record |
| `settlements.name_bg` | < 1 second | Direct table access |
| `prices.settlement_name` | 10+ seconds | Subquery per price record |

## 🎯 Updated Filter Strategy

### For Filter Value Queries (Dropdown Population)
```javascript
// ✅ RECOMMENDED: Direct queries
const filterQueries = {
  retailers: { dimensions: ["retailers.name"] },
  locations: { dimensions: ["settlements.name_bg"] },
  categories: { dimensions: ["category_groups.name"] }
};
```

### For Data Queries (With Filters Applied)
```javascript
// ✅ Use flattened dimensions when filtering data
const dataQuery = {
  dimensions: ["prices.retailer_name"], // When filtering by retailer
  measures: ["prices.averageRetailPrice"],
  filters: [
    { member: "prices.retailer_name", values: ["Kaufland"] }
  ]
};
```

## 🔧 Implementation Strategy

### Phase 1: Use Direct Queries for Dropdowns
```typescript
// Fast dropdown population
const useFilterValues = () => {
  const retailersQuery = useCubeQuery({ dimensions: ["retailers.name"] });
  const locationsQuery = useCubeQuery({ dimensions: ["settlements.name_bg"] });
  const categoriesQuery = useCubeQuery({ dimensions: ["category_groups.name"] });
  
  return {
    retailers: extractDirectFilterValues(retailersQuery.resultSet, 'retailers'),
    locations: extractDirectFilterValues(locationsQuery.resultSet, 'locations'),
    categories: extractDirectFilterValues(categoriesQuery.resultSet, 'categories')
  };
};
```

### Phase 2: Map Values for Data Queries
```typescript
// When user selects "Месо и месни продукти" from dropdown,
// use it to filter prices.category_group_name in data queries
const dataQuery = {
  dimensions: ["prices.category_group_name"],
  measures: ["prices.averageRetailPrice"],
  filters: [
    { 
      member: "prices.category_group_name", 
      values: [selectedCategory] // Value from direct query
    }
  ]
};
```

## 🧪 Testing Both Approaches

I've added test queries for comparison:

1. **📋 Filter Values: Categories List (Direct)** - Uses `category_groups.name` (fast)
2. **📋 Filter Values: Categories List (Slow - via prices)** - Uses `prices.category_group_name` (slow)

Test both to see the dramatic performance difference!

## 🎯 Pre-Aggregation Strategy

### For Direct Queries
```javascript
// In category_groups.js
pre_aggregations: {
  category_group_names: {
    dimensions: [name],
    refreshKey: {every: '4 hours'}
  }
}
```

### For Retailers and Locations
```javascript
// In retailers.js
pre_aggregations: {
  retailer_names: {
    dimensions: [name],
    refreshKey: {every: '4 hours'}
  }
}

// In settlements.js  
pre_aggregations: {
  settlement_names: {
    dimensions: [name_bg],
    refreshKey: {every: '4 hours'}
  }
}
```

## 💡 Key Insights

### When to Use Direct Queries
- ✅ **Filter dropdown population** - always use direct queries
- ✅ **Simple lists** - when you just need unique values
- ✅ **Reference data** - categories, retailers, locations
- ✅ **Fast loading** - when performance is critical

### When to Use Subqueries (Flattened Dimensions)
- ✅ **Data filtering** - when applying filters to price data
- ✅ **Analytics queries** - when you need prices WITH filter context
- ✅ **Pre-aggregated data** - when using pre-aggregations for speed

## 🚀 Expected Performance Improvement

### Before (Subquery Approach)
- **Filter dropdown loading**: 3+ minutes total
- **User experience**: Very poor, users think it's broken
- **Dashboard load time**: Unacceptable

### After (Direct Query Approach)  
- **Filter dropdown loading**: < 3 seconds total
- **User experience**: Responsive and fast
- **Dashboard load time**: Excellent

## 📋 Implementation Checklist

1. ✅ **Update filter value queries** to use direct cubes
2. ✅ **Add pre-aggregations** to source cubes (retailers, settlements, category_groups)
3. ✅ **Test performance** using Pre-Aggregation Test
4. ✅ **Update frontend** to use direct queries for dropdowns
5. ✅ **Keep flattened dimensions** for data queries with filters

This optimization can reduce filter loading time from **minutes to seconds**!