# Filter Values Guide - Populating Dropdown Lists

## 🎯 What Are Filter Value Queries?

Filter value queries are **special queries** that populate the dropdown lists in your dashboard filters. These queries:

1. **Fetch unique values** for each filter type (retailers, locations, categories)
2. **Run on dashboard load** - critical for initial performance
3. **Have no measures** - only dimensions
4. **Have no time filters** - we want ALL possible values, not just recent ones

## 📋 The 4 Filter Value Queries

### 1. 🏪 Retailers List
```javascript
{
  dimensions: ["prices.retailer_name"],
  measures: [], // No measures needed
  filters: [],  // No filters - we want ALL retailers
  // No timeDimensions - we want retailers from all time periods
  order: { "prices.retailer_name": "asc" }
}
```

**Purpose**: Populate retailer dropdown with all available retailers
**Expected Result**: `["Billa", "Kaufland", "Lidl", "Fantastico", ...]`

### 2. 📍 Locations List  
```javascript
{
  dimensions: ["prices.settlement_name"],
  measures: [], // No measures needed
  filters: [],  // No filters - we want ALL locations
  // No timeDimensions - we want locations from all time periods
  order: { "prices.settlement_name": "asc" }
}
```

**Purpose**: Populate location dropdown with all available settlements
**Expected Result**: `["София", "Пловдив", "Варна", "Бургас", ...]`

### 3. 🛒 Categories List
```javascript
{
  dimensions: ["prices.category_group_name"],
  measures: [], // No measures needed
  filters: [],  // No filters - we want ALL categories
  // No timeDimensions - we want categories from all time periods
  order: { "prices.category_group_name": "asc" }
}
```

**Purpose**: Populate category dropdown with all available categories
**Expected Result**: `["Месо и месни продукти", "Млечни продукти", ...]`

### 4. 📊 All Filter Values Combined
```javascript
{
  dimensions: [
    "prices.retailer_name",
    "prices.settlement_name", 
    "prices.category_group_name"
  ],
  measures: [], // No measures needed
  filters: [],  // No filters - we want ALL combinations
  // No timeDimensions - we want all combinations from all time periods
  order: { "prices.retailer_name": "asc" }
}
```

**Purpose**: Get all possible filter combinations (for advanced filtering logic)
**Expected Result**: All unique combinations of retailer + location + category

## 🚀 Why These Queries Are Critical

### Performance Impact
- **Run on every dashboard load** - users see these immediately
- **Block UI rendering** - slow queries = slow dashboard load
- **User experience** - fast dropdowns = responsive dashboard

### Expected Performance
- **Target**: < 200ms per query
- **Acceptable**: < 500ms per query  
- **Problem**: > 1000ms per query

## 🎯 Pre-Aggregation Strategy

### Dedicated Filter Value Pre-Aggregations
I've added specific pre-aggregations for these queries:

```javascript
// Individual filter lists
retailer_values: {
  dimensions: [retailer_name],
  refreshKey: {every: '6 hours'}
},

location_values: {
  dimensions: [settlement_name], 
  refreshKey: {every: '6 hours'}
},

category_values: {
  dimensions: [category_group_name],
  refreshKey: {every: '6 hours'}
},

// Combined filter values
all_filter_values: {
  dimensions: [retailer_name, settlement_name, category_group_name],
  refreshKey: {every: '6 hours'}
}
```

### Why 6 Hour Refresh?
- **Filter values change rarely** - new retailers/locations/categories are infrequent
- **Longer refresh = better performance** - less rebuilding overhead
- **Still fresh enough** - new values appear within 6 hours

## 🧪 Testing Filter Value Queries

### What to Test
1. **Individual lists** - each filter type separately
2. **Combined query** - all filter values together
3. **Performance** - should be very fast (< 200ms)
4. **Completeness** - should return all expected values

### Expected Results
```javascript
// Retailers query should return
{
  "prices.retailer_name": "Billa"
},
{
  "prices.retailer_name": "Kaufland"  
},
{
  "prices.retailer_name": "Lidl"
}
// ... etc

// Locations query should return
{
  "prices.settlement_name": "София"
},
{
  "prices.settlement_name": "Пловдив"
}
// ... etc
```

## 🔧 Implementation Patterns

### Pattern 1: Separate Queries (Recommended)
```javascript
// Fetch each filter type separately
const retailersQuery = { dimensions: ["prices.retailer_name"] };
const locationsQuery = { dimensions: ["prices.settlement_name"] };
const categoriesQuery = { dimensions: ["prices.category_group_name"] };

// Parallel execution
const [retailers, locations, categories] = await Promise.all([
  cubeApi.load(retailersQuery),
  cubeApi.load(locationsQuery), 
  cubeApi.load(categoriesQuery)
]);
```

**Pros**: Fast, uses specific pre-aggregations, parallel execution
**Cons**: Multiple queries

### Pattern 2: Combined Query
```javascript
// Fetch all filter values in one query
const allFiltersQuery = {
  dimensions: [
    "prices.retailer_name",
    "prices.settlement_name",
    "prices.category_group_name"
  ]
};

const result = await cubeApi.load(allFiltersQuery);
// Extract unique values for each filter type
```

**Pros**: Single query, less network overhead
**Cons**: Larger result set, more complex processing

## 🎯 Common Issues & Solutions

### Issue 1: Slow Filter Value Queries
**Symptoms**: Dashboard takes 5+ seconds to load
**Cause**: Filter value queries not matching pre-aggregations
**Solution**: Ensure queries match the dedicated filter value pre-aggregations

### Issue 2: Missing Filter Values
**Symptoms**: Some retailers/locations don't appear in dropdowns
**Cause**: Queries have time filters or other restrictions
**Solution**: Remove all filters and time dimensions from filter value queries

### Issue 3: Stale Filter Values
**Symptoms**: New retailers/locations don't appear for hours
**Cause**: Pre-aggregation refresh too infrequent
**Solution**: Reduce refresh interval or trigger manual refresh

## 💡 Best Practices

### Query Design
1. **No measures** - only dimensions needed
2. **No time filters** - want all historical values
3. **No other filters** - want complete lists
4. **Include ordering** - for consistent UI presentation

### Pre-Aggregation Design
1. **Dedicated pre-aggregations** - don't mix with data queries
2. **Longer refresh intervals** - filter values change rarely
3. **Simple structure** - just dimensions, no complexity

### Frontend Implementation
1. **Cache results** - don't refetch on every component mount
2. **Parallel loading** - fetch all filter values simultaneously
3. **Loading states** - show skeleton while fetching
4. **Error handling** - graceful fallback if queries fail

## 🚀 Performance Optimization

### Expected Timeline
- **Without pre-aggregations**: 2-10 seconds per query
- **With pre-aggregations**: 50-200ms per query
- **Total dashboard load**: < 1 second (vs 10+ seconds)

### Monitoring
- **Track query times** - log filter value query performance
- **Monitor pre-aggregation hits** - ensure queries match pre-aggregations
- **User experience metrics** - measure dashboard load time

This optimization can dramatically improve your dashboard's perceived performance!