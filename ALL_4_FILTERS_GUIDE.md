# Complete Guide: All 4 Filter Types

## 🎯 The 4 Filter Types

Your dashboard supports **4 types of filters**:

1. **🏪 Retailer Filter** (`prices.retailer_name`)
2. **📍 Location Filter** (`prices.settlement_name`) 
3. **🛒 Category Filter** (`prices.category_group_name`)
4. **⏰ Time Filter** (`prices.price_date` with `dateRange`)

## 🔍 How Each Filter Type Works

### 1. 🏪 Retailer Filter
```javascript
// Filter by specific retailers
{
  dimensions: ["prices.retailer_name"], // ← MUST include filtered dimension
  filters: [
    { member: "prices.retailer_name", operator: "equals", values: ["Kaufland", "Billa"] }
  ]
}
```

**Key Rules:**
- ✅ Must include `prices.retailer_name` in dimensions
- ✅ Can filter by single or multiple retailers
- ✅ Matches `retailer_only_filtered` pre-aggregation

### 2. 📍 Location Filter  
```javascript
// Filter by specific locations (settlements)
{
  dimensions: ["prices.settlement_name"], // ← MUST include filtered dimension
  filters: [
    { member: "prices.settlement_name", operator: "equals", values: ["София", "Пловдив"] }
  ]
}
```

**Key Rules:**
- ✅ Must include `prices.settlement_name` in dimensions
- ✅ Can filter by single or multiple locations
- ✅ Matches `location_only_filtered` pre-aggregation

### 3. 🛒 Category Filter
```javascript
// Filter by specific categories
{
  dimensions: ["prices.category_group_name"], // ← MUST include filtered dimension
  filters: [
    { member: "prices.category_group_name", operator: "equals", values: ["Месо и месни продукти"] }
  ]
}
```

**Key Rules:**
- ✅ Must include `prices.category_group_name` in dimensions
- ✅ Can filter by single or multiple categories
- ✅ Matches `category_only_filtered` pre-aggregation

### 4. ⏰ Time Filter (Special!)
```javascript
// Filter by time range
{
  timeDimensions: [
    {
      dimension: "prices.price_date",
      granularity: "day",
      dateRange: "Last 30 days" // ← This is the time filter
    }
  ]
  // Note: NO need to include in dimensions!
}
```

**Key Rules:**
- ✅ **Does NOT** need to be included in dimensions (unlike other filters)
- ✅ Any date range works with same granularity
- ✅ Granularity must match pre-aggregation exactly
- ✅ All time ranges match `time_only_filtered` pre-aggregation

## 🎯 Filter Combinations & Pre-Aggregation Matching

### Single Filters
| Filter Combination | Dimensions Required | Matches Pre-Aggregation |
|-------------------|-------------------|------------------------|
| Retailer only | `[retailer_name]` | `retailer_only_filtered` |
| Location only | `[settlement_name]` | `location_only_filtered` |
| Category only | `[category_group_name]` | `category_only_filtered` |
| Time only | `[]` | `time_only_filtered` |

### Two Filter Combinations
| Filter Combination | Dimensions Required | Matches Pre-Aggregation |
|-------------------|-------------------|------------------------|
| Retailer + Location | `[retailer_name, settlement_name]` | `retailer_location_filtered` |
| Retailer + Category | `[retailer_name, category_group_name]` | `retailer_category_filtered` |
| Location + Category | `[settlement_name, category_group_name]` | `location_category_filtered` |
| Retailer + Time | `[retailer_name]` | `retailer_only_filtered` |
| Location + Time | `[settlement_name]` | `location_only_filtered` |
| Category + Time | `[category_group_name]` | `category_only_filtered` |

### Three Filter Combinations
| Filter Combination | Dimensions Required | Matches Pre-Aggregation |
|-------------------|-------------------|------------------------|
| Retailer + Location + Category | `[retailer_name, settlement_name, category_group_name]` | `universal_filtered` |
| Retailer + Location + Time | `[retailer_name, settlement_name]` | `retailer_location_filtered` |
| Retailer + Category + Time | `[retailer_name, category_group_name]` | `retailer_category_filtered` |
| Location + Category + Time | `[settlement_name, category_group_name]` | `location_category_filtered` |

### All Four Filters
| Filter Combination | Dimensions Required | Matches Pre-Aggregation |
|-------------------|-------------------|------------------------|
| Retailer + Location + Category + Time | `[retailer_name, settlement_name, category_group_name]` | `universal_filtered` |

## ⏰ Time Filter Deep Dive

### Why Time Filters Are Special

1. **No Dimension Required**: Unlike other filters, time filters don't need the time dimension in the `dimensions` array
2. **Flexible Date Ranges**: Any date range works with the same pre-aggregation
3. **Granularity Matters**: The granularity must match exactly

### Time Filter Examples (All Match Same Pre-Aggregation!)
```javascript
// All of these match time_only_filtered pre-aggregation
Query1: { timeDimensions: [{ dimension: "prices.price_date", granularity: "day", dateRange: "Last 7 days" }] }
Query2: { timeDimensions: [{ dimension: "prices.price_date", granularity: "day", dateRange: "Last 30 days" }] }
Query3: { timeDimensions: [{ dimension: "prices.price_date", granularity: "day", dateRange: "Last 90 days" }] }
Query4: { timeDimensions: [{ dimension: "prices.price_date", granularity: "day", dateRange: "This month" }] }
Query5: { timeDimensions: [{ dimension: "prices.price_date", granularity: "day", dateRange: ["2025-01-01", "2025-12-31"] }] }
```

### Performance Implications
- **Date range size doesn't affect performance** - 7 days vs 90 days = same speed
- **Granularity affects performance** - must match pre-aggregation granularity
- **Time + other filters** - time filter is "free" when combined with other filters

## 🧪 Testing All Filter Combinations

### Test Categories in Pre-Aggregation Test:

1. **🔍 Basic Filter Testing**
   - Individual filter types
   - Simple combinations

2. **⏰ Time Filter Testing**  
   - Different date ranges (all should be same speed!)
   - Proves time range flexibility

3. **🎯 All 4 Filters**
   - Complete filter combinations
   - Tests universal_filtered pre-aggregation

4. **🔍 Partial Combinations**
   - 3 out of 4 filter types
   - Tests specific combination pre-aggregations

## 💡 Key Insights

### For Developers:
1. **Time filters are flexible** - any date range, same performance
2. **Regular filters need dimensions** - always include filtered dimensions
3. **Pre-aggregation matching is predictable** - based on dimension combinations
4. **Performance is consistent** - filter values don't affect speed, only filter types

### For Users:
1. **Time filtering is fast** - change date ranges freely
2. **Multiple filters work together** - combine any filter types
3. **Filter values are flexible** - single or multiple values per filter
4. **Performance stays good** - proper pre-aggregations handle all combinations

## 🚀 Implementation Strategy

### Option 1: Dynamic Dimensions (Recommended)
```javascript
// Only include dimensions for active filters
const dimensions = [];
if (filters.retailers.length > 0) dimensions.push("prices.retailer_name");
if (filters.locations.length > 0) dimensions.push("prices.settlement_name");  
if (filters.categories.length > 0) dimensions.push("prices.category_group_name");

// Will match the most specific pre-aggregation available
```

### Option 2: Always Include All Dimensions
```javascript
// Always include all possible dimensions
const dimensions = [
  "prices.retailer_name",
  "prices.settlement_name", 
  "prices.category_group_name"
];

// Will always match universal_filtered pre-aggregation
```

## 🎯 Best Practices

1. **Use consistent granularity** - stick to "day" for all time queries
2. **Include filtered dimensions** - always add filtered dimensions to dimensions array
3. **Test filter combinations** - use Pre-Aggregation Test to verify performance
4. **Monitor pre-aggregation matching** - check logs to ensure queries match pre-aggregations
5. **Keep time filters flexible** - let users choose any date range

This comprehensive filter system gives you maximum flexibility while maintaining excellent performance through pre-aggregations!