# Cube.js Queries for Server Optimization

## Query 1: Retailer Chart Data
**Purpose**: Main chart showing price trends by retailer (last 30 days)

```graphql
query RetailerChartData {
  cube(
    orderBy: {
      prices: { price_date: ASC }
    }
  ) {
    prices {
      price_date(granularity: day)
      averageRetailPrice
    }
    retailers {
      name
    }
  }
}
```

**Cube.js JSON Format:**
```json
{
  "dimensions": ["retailers.name"],
  "measures": ["prices.averageRetailPrice"],
  "timeDimensions": [
    {
      "dimension": "prices.price_date",
      "granularity": "day",
      "dateRange": "Last 30 days"
    }
  ],
  "order": {
    "prices.price_date": "asc"
  },
  "filters": []
}
```

---

## Query 2: Retailer List (Dropdown)
**Purpose**: Get all retailers for the filter dropdown

```graphql
query RetailerList {
  cube(
    orderBy: {
      retailers: { name: ASC }
    }
  ) {
    retailers {
      name
    }
  }
}
```

**Cube.js JSON Format:**
```json
{
  "dimensions": ["retailers.name"],
  "measures": [],
  "timeDimensions": [],
  "filters": [],
  "order": {
    "retailers.name": "asc"
  }
}
```

---

## Query 3: Category Chart Data
**Purpose**: Main chart showing price trends by category (last 30 days)

```graphql
query CategoryChartData {
  cube(
    where: {
      prices: {
        price_date: { inDateRange: "last 30 days" }
      }
    }
    orderBy: {
      prices: { price_date: ASC }
    }
  ) {
    prices {
      price_date(granularity: day)
      averageRetailPrice
    }
    category_groups {
      name
    }
  }
}
```

**Cube.js JSON Format:**
```json
{
  "dimensions": ["category_groups.name"],
  "measures": ["prices.averageRetailPrice"],
  "timeDimensions": [
    {
      "dimension": "prices.price_date",
      "granularity": "day",
      "dateRange": "Last 30 days"
    }
  ],
  "order": {
    "prices.price_date": "asc"
  },
  "filters": []
}
```

---

## Optimization Recommendations

### 1. Pre-Aggregations
Create pre-aggregations for the most common queries:

```javascript
// In your Cube schema
cube(`Prices`, {
  // ... existing schema
  
  preAggregations: {
    // For retailer chart
    retailerPricesByDay: {
      measures: [averageRetailPrice],
      dimensions: [Retailers.name],
      timeDimension: price_date,
      granularity: `day`,
      partitionGranularity: `month`,
      refreshKey: {
        every: `1 day`,
      },
    },
    
    // For category chart
    categoryPricesByDay: {
      measures: [averageRetailPrice],
      dimensions: [CategoryGroups.name],
      timeDimension: price_date,
      granularity: `day`,
      partitionGranularity: `month`,
      refreshKey: {
        every: `1 day`,
      },
    },
  },
});
```

### 2. Indexes
Ensure these database indexes exist:

```sql
-- For retailer queries
CREATE INDEX idx_prices_retailer_date 
ON prices(retailer_id, price_date);

-- For category queries
CREATE INDEX idx_prices_category_date 
ON prices(category_group_id, price_date);

-- For date range queries
CREATE INDEX idx_prices_date 
ON prices(price_date DESC);

-- For retailer list
CREATE INDEX idx_retailers_name 
ON retailers(name);
```

### 3. Query Patterns

**Most Frequent Queries:**
1. Last 30 days by retailer (loads on page open)
2. Last 30 days by category (loads on tab switch)
3. Retailer list (loads once, cached)

**Query Frequency:**
- Initial load: 3 queries
- Tab switch: 0 queries (cached)
- Page revisit: 0 queries (cached in session)
- After 24h or refresh: 3 queries

### 4. Caching Strategy

**Server-side (Cube.js):**
```javascript
module.exports = {
  cacheAndQueueDriver: 'redis',
  orchestratorOptions: {
    queryCacheOptions: {
      refreshKeyRenewalThreshold: 86400, // 24 hours
      backgroundRenew: true,
    },
  },
};
```

**Client-side:**
- Results cached in browser memory during session
- `resetResultSetOnChange: false` prevents refetch on remount

### 5. Performance Targets

With optimizations:
- **Initial load**: < 500ms per query
- **Cached load**: < 50ms (memory)
- **Tab switch**: 0ms (no query)
- **Total dashboard load**: < 1.5s

### 6. Monitoring Queries

To see actual queries being made, check browser DevTools:
1. Network tab
2. Filter by "load" or your Cube API URL
3. Inspect request payload

Or enable Cube.js query logging:
```javascript
// In cube.js config
module.exports = {
  queryRewrite: (query, { securityContext }) => {
    console.log('Query:', JSON.stringify(query, null, 2));
    return query;
  },
};
```

---

## Summary

**Total Unique Queries: 3**
1. Retailer chart (30 days)
2. Category chart (30 days)
3. Retailer list (all)

**Data Volume:**
- ~30 days × ~10 retailers × 1 measure = ~300 data points per chart
- Retailer list: ~10 items

**Optimization Priority:**
1. ⭐⭐⭐ Pre-aggregations (biggest impact)
2. ⭐⭐ Database indexes
3. ⭐ Redis caching
