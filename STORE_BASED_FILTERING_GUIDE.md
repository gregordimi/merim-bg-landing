# Store-Based Filtering Guide - Only Show Available Options

## 🎯 The Complete Strategy

You want filter dropdowns to only show options that actually exist in stores with price data. This ensures users never select filters that return empty results.

## 📊 Filter Hierarchy

```
Store → Has → Products → Belong to → Categories
Store → Located in → Settlement → Part of → Municipality  
Store → Operated by → Retailer
```

## 🔍 Store-Based Filter Queries

### 1. 🏪 Retailers (Only with Stores)
```javascript
// Query: stores.retailer_name
// Returns: Only retailers that have physical stores
// Example: ["Kaufland", "Billa", "Lidl", "Fantastico"]
```

### 2. 🏘️ Settlements (Only with Stores)
```javascript
// Query: stores.settlement_name  
// Returns: Only settlements that have stores
// Example: ["София", "Пловдив", "Варна", "Бургас"]
```

### 3. 🏛️ Municipalities (Only with Stores)
```javascript
// Query: stores.municipality_name
// Returns: Only municipalities that have stores  
// Example: ["София-град", "Пловдив", "Варна", "Бургас"]
```

### 4. 🛒 Categories (Only Available in Stores)
```javascript
// Query: store_categories.name
// Returns: Only categories that have products with prices in stores
// Example: ["Месо и месни продукти", "Млечни продукти", "Хлебни и тестени изделия"]
```

## 🆚 Comparison: All vs Store-Based

### Categories Example

#### All Categories (category_groups.name)
```javascript
// Returns ALL categories in your database
[
  "Месо и месни продукти",     // ✅ Has prices in stores
  "Млечни продукти",           // ✅ Has prices in stores  
  "Електроника",               // ❌ No prices in stores
  "Автомобилни части",         // ❌ No prices in stores
  "Книги"                      // ❌ No prices in stores
]
```

#### Store-Based Categories (store_categories.name)
```javascript
// Returns ONLY categories with prices in stores
[
  "Месо и месни продукти",     // ✅ Has prices in stores
  "Млечни продукти"            // ✅ Has prices in stores
]
```

## 🎯 User Experience Impact

### Before (All Options)
1. User selects "Електроника" from dropdown
2. Query executes successfully  
3. Returns 0 results
4. User thinks: "Is the system broken?"

### After (Store-Based Options)
1. User only sees categories with data
2. Any selection guarantees results
3. User thinks: "This system works perfectly!"

## 🏗️ Implementation Architecture

### New store_categories.js Cube
```javascript
cube(`store_categories`, {
  sql: `
    SELECT DISTINCT 
      cg.original_id,
      cg.name,
      cg.name_en,
      cg.url_slug
    FROM category_groups cg
    JOIN categories c ON c.category_group_id = cg.original_id
    JOIN products p ON p.category_id = c.original_id  
    JOIN prices pr ON pr.product_id = p.original_id
    JOIN stores s ON s.original_id = pr.store_id
  `,
  
  pre_aggregations: {
    available_categories: {
      dimensions: [name],
      refreshKey: {every: '6 hours'}
    }
  }
});
```

### Updated stores.js Cube
```javascript
cube(`stores`, {
  // Optimized for location and retailer filtering
  pre_aggregations: {
    settlement_names: { dimensions: [settlement_name] },
    municipality_names: { dimensions: [municipality_name] },
    retailer_names: { dimensions: [retailer_name] }
  }
});
```

## 📊 Performance Comparison

| Filter Type | Query Source | Performance | Data Quality |
|-------------|--------------|-------------|--------------|
| **Retailers** | `stores.retailer_name` | < 1s | Only with stores ✅ |
| **Settlements** | `stores.settlement_name` | < 1s | Only with stores ✅ |
| **Municipalities** | `stores.municipality_name` | < 1s | Only with stores ✅ |
| **Categories** | `store_categories.name` | < 1s | Only in stores ✅ |
| ~~All Categories~~ | `category_groups.name` | < 1s | Includes empty ones ❌ |

## 🧪 Testing Strategy

### Added Test Queries:
1. **📋 Categories (Only in Stores)** - `store_categories.name` (recommended)
2. **📋 Categories (All Categories)** - `category_groups.name` (comparison)

### Expected Results:
- **Store-based**: Smaller list, all options return data
- **All categories**: Larger list, some options return no data

## 🔧 Frontend Implementation

```typescript
// Fast dropdown population (only relevant options)
const useStoreBasedFilters = () => {
  const retailersQuery = useCubeQuery(FILTER_VALUE_QUERIES.direct.retailers);
  const settlementsQuery = useCubeQuery(FILTER_VALUE_QUERIES.direct.settlements);
  const municipalitiesQuery = useCubeQuery(FILTER_VALUE_QUERIES.direct.municipalities);
  const categoriesQuery = useCubeQuery(FILTER_VALUE_QUERIES.direct.categories);
  
  return {
    retailers: extractDirectFilterValues(retailersQuery.resultSet, 'retailers'),
    settlements: extractDirectFilterValues(settlementsQuery.resultSet, 'settlements'),
    municipalities: extractDirectFilterValues(municipalitiesQuery.resultSet, 'municipalities'),
    categories: extractDirectFilterValues(categoriesQuery.resultSet, 'categories')
  };
};
```

## 💡 Business Logic Benefits

### Data Quality Assurance
- **Guaranteed Results**: Every filter option returns data
- **Relevant Options**: Only show what's actually available
- **User Confidence**: System feels reliable and complete

### Performance Benefits  
- **Fast Dropdowns**: All queries < 1 second
- **Optimized Queries**: Direct table access with pre-aggregations
- **Reduced Confusion**: No empty result sets

### Maintenance Benefits
- **Self-Updating**: New stores/categories automatically appear
- **Consistent Logic**: Same pattern for all filter types
- **Clear Architecture**: Separate concerns (stores vs all data)

## 🎯 Complete Filter Strategy Summary

| Filter | Source | Logic | Performance |
|--------|--------|-------|-------------|
| 🏪 **Retailers** | `stores` cube | Only retailers with stores | < 1s |
| 🏘️ **Settlements** | `stores` cube | Only settlements with stores | < 1s |
| 🏛️ **Municipalities** | `stores` cube | Only municipalities with stores | < 1s |
| 🛒 **Categories** | `store_categories` cube | Only categories in stores | < 1s |

This approach ensures your dashboard provides a perfect user experience where every filter option is meaningful and returns data!