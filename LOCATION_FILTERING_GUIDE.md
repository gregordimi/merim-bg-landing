# Location Filtering Guide - Settlements & Municipalities

## 🎯 Location Hierarchy

Your location data follows this hierarchy:
```
Store → Settlement → Municipality
```

**Example:**
- **Store**: "Kaufland София Мол"
- **Settlement**: "София" 
- **Municipality**: "София-град"

## 🔍 The Problem with All Locations

### Before (Showing All Locations)
```javascript
// This shows ALL settlements, even those without stores
{ dimensions: ["settlements.name_bg"] }
```

**Issues:**
- Shows settlements with no stores/prices
- Confuses users with empty filter results
- Poor user experience

### After (Only Locations with Stores)
```javascript
// This shows ONLY settlements that have stores
{ dimensions: ["stores.settlement_name"] }
```

**Benefits:**
- Only shows relevant locations
- All filter selections return data
- Better user experience

## 🏪 Updated Filter Strategy

### 1. 🏪 Retailers (Only with Stores)
```javascript
{
  dimensions: ["stores.retailer_name"],
  order: { "stores.retailer_name": "asc" }
}
```
**Returns**: Only retailers that actually have stores

### 2. 🏘️ Settlements (Only with Stores)  
```javascript
{
  dimensions: ["stores.settlement_name"],
  order: { "stores.settlement_name": "asc" }
}
```
**Returns**: Only settlements that have stores (София, Пловдив, etc.)

### 3. 🏛️ Municipalities (Only with Stores)
```javascript
{
  dimensions: ["stores.municipality_name"], 
  order: { "stores.municipality_name": "asc" }
}
```
**Returns**: Only municipalities that have stores (София-град, Пловдив, etc.)

### 4. 🛒 Categories (All Available)
```javascript
{
  dimensions: ["category_groups.name"],
  order: { "category_groups.name": "asc" }
}
```
**Returns**: All product categories

## 🎯 Updated GlobalFilters Interface

```typescript
export interface GlobalFilters {
  retailers: string[];
  settlements: string[];      // New: separate from municipalities
  municipalities: string[];   // New: separate filter type
  categories: string[];
  dateRange?: string[];
}
```

## 🔧 Filter Combinations

### Single Location Filters
```javascript
// Settlement filter only
{
  dimensions: ["prices.settlement_name"],
  filters: [{ member: "prices.settlement_name", values: ["София"] }]
}

// Municipality filter only  
{
  dimensions: ["prices.municipality_name"],
  filters: [{ member: "prices.municipality_name", values: ["София-град"] }]
}
```

### Combined Location Filters
```javascript
// Both settlement AND municipality filters
{
  dimensions: ["prices.settlement_name", "prices.municipality_name"],
  filters: [
    { member: "prices.settlement_name", values: ["София"] },
    { member: "prices.municipality_name", values: ["София-град"] }
  ]
}
```

## 📊 Pre-Aggregation Strategy

### Filter Value Pre-Aggregations (in stores.js)
```javascript
// Only locations with stores
settlement_names: {
  dimensions: [settlement_name],
  refreshKey: {every: '6 hours'}
},

municipality_names: {
  dimensions: [municipality_name], 
  refreshKey: {every: '6 hours'}
},

retailer_names: {
  dimensions: [retailer_name],
  refreshKey: {every: '6 hours'}
}
```

### Data Query Pre-Aggregations (in prices.js)
```javascript
// Individual location filters
settlement_only_filtered: {
  measures: [averageRetailPrice, averagePromoPrice],
  dimensions: [settlement_name],
  timeDimension: price_date,
  granularity: 'day'
},

municipality_only_filtered: {
  measures: [averageRetailPrice, averagePromoPrice], 
  dimensions: [municipality_name],
  timeDimension: price_date,
  granularity: 'day'
},

// Universal filter (all combinations)
universal_filtered: {
  measures: [averageRetailPrice, averagePromoPrice],
  dimensions: [retailer_name, settlement_name, municipality_name, category_group_name],
  timeDimension: price_date,
  granularity: 'day'
}
```

## 🧪 Testing Location Filters

### New Test Queries Added:
1. **📋 Settlements List (Only with Stores)** - Fast dropdown population
2. **📋 Municipalities List (Only with Stores)** - Fast dropdown population  
3. **🔍 Municipality Only Filter** - Test municipality filtering

### Expected Performance:
- **Filter value queries**: < 1 second (via stores cube)
- **Data queries with location filters**: 200-500ms (via pre-aggregations)

## 💡 User Experience Benefits

### Before:
- User selects "Враца" from dropdown
- Query returns no results (no stores in Враца)
- User confused, thinks system is broken

### After:
- Dropdown only shows settlements with stores
- Any selection guarantees results
- Clear, predictable user experience

## 🔧 Implementation Example

```typescript
// Frontend usage
const useLocationFilters = () => {
  // Fast queries for dropdowns (only locations with stores)
  const settlementsQuery = useCubeQuery(FILTER_VALUE_QUERIES.direct.settlements);
  const municipalitiesQuery = useCubeQuery(FILTER_VALUE_QUERIES.direct.municipalities);
  
  return {
    settlements: extractDirectFilterValues(settlementsQuery.resultSet, 'settlements'),
    municipalities: extractDirectFilterValues(municipalitiesQuery.resultSet, 'municipalities')
  };
};

// Data query with location filters
const useLocationData = (globalFilters: GlobalFilters) => {
  const query = buildOptimizedQuery(
    ["prices.averageRetailPrice", "prices.averagePromoPrice"],
    globalFilters
  );
  
  return useCubeQuery(query);
};
```

## 🎯 Key Benefits

1. **Relevant Options Only**: Dropdowns show only locations with actual data
2. **Fast Performance**: Direct queries to stores cube (< 1s vs minutes)
3. **Guaranteed Results**: Any filter selection returns data
4. **Flexible Filtering**: Support both settlement and municipality levels
5. **Pre-Aggregated**: All filter combinations use optimized pre-aggregations

This approach ensures users only see meaningful filter options while maintaining excellent performance!