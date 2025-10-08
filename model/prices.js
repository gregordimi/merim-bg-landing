cube(`prices`, {
  sql_table: `public.prices`,
  
  joins: {
    stores: {
      relationship: `many_to_one`,
      sql: `${CUBE}.store_id = ${stores}.original_id`
    },
    products: {
      relationship: `many_to_one`,
      sql: `${CUBE}.product_id = ${products}.original_id`
    },
    // Geographic joins
    settlements: {
      relationship: `many_to_one`,
      sql: `${CUBE}.store_id = ${stores}.original_id AND ${stores}.settlement_ekatte = ${settlements}.ekatte`
    },
    municipality: {
      relationship: `many_to_one`,
      sql: `${CUBE}.store_id = ${stores}.original_id AND ${stores}.settlement_ekatte = ${settlements}.ekatte AND ${settlements}.municipality = ${municipality}.code`
    },
    // Retailer join
    retailers: {
      relationship: `many_to_one`,
      sql: `${CUBE}.store_id = ${stores}.original_id AND ${stores}.retailer_id = ${retailers}.id`
    },
    // Category joins
    categories: {
      relationship: `many_to_one`,
      sql: `${CUBE}.product_id = ${products}.original_id AND ${products}.category_id = ${categories}.original_id`
    },
    category_groups: {
      relationship: `many_to_one`,
      sql: `${CUBE}.product_id = ${products}.original_id AND ${products}.category_id = ${categories}.original_id AND ${categories}.category_group_id = ${category_groups}.original_id`
    }
  },
  
  dimensions: {
    price_date: {
      sql: `price_date`,
      type: `time`,
      primary_key: true,
      public: true
    },
    store_id: {
      sql: `store_id`,
      type: `string`,
      primary_key: true,
      public: true
    },
    product_id: {
      sql: `product_id`,
      type: `string`,
      primary_key: true,
      public: true
    },
    retail_price: {
      sql: `retail_price`,
      type: `number`
    },
    promo_price: {
      sql: `promo_price`,
      type: `number`
    },
    last_updated: {
      sql: `last_updated`,
      type: `time`
    }
  },
  
  measures: {
    count: {
      type: `count`
    },
    // Existing average measures (NON-ADDITIVE)
    averageRetailPrice: {
      sql: `NULLIF(${CUBE}.retail_price, 0)`,
      type: `avg`,
      format: `currency`
    },
    averagePromoPrice: {
      sql: `NULLIF(${CUBE}.promo_price, 0)`,
      type: `avg`,
      format: `currency`
    },
    // NEW: Additive measures for better caching (ADDITIVE)
    totalRetailPrice: {
      sql: `NULLIF(${CUBE}.retail_price, 0)`,
      type: `sum`,
      format: `currency`
    },
    totalPromoPrice: {
      sql: `NULLIF(${CUBE}.promo_price, 0)`,
      type: `sum`,
      format: `currency`
    },
    retailPriceCount: {
      sql: `CASE WHEN NULLIF(${CUBE}.retail_price, 0) IS NOT NULL THEN 1 ELSE 0 END`,
      type: `sum`
    },
    promoPriceCount: {
      sql: `CASE WHEN NULLIF(${CUBE}.promo_price, 0) IS NOT NULL THEN 1 ELSE 0 END`,
      type: `sum`
    },
    // Min/Max measures (ADDITIVE)
    minRetailPrice: {
      sql: `NULLIF(${CUBE}.retail_price, 0)`,
      type: `min`,
      format: `currency`
    },
    minPromoPrice: {
      sql: `NULLIF(${CUBE}.promo_price, 0)`,
      type: `min`,
      format: `currency`
    },
    maxRetailPrice: {
      sql: `NULLIF(${CUBE}.retail_price, 0)`,
      type: `max`,
      format: `currency`
    },
    maxPromoPrice: {
      sql: `NULLIF(${CUBE}.promo_price, 0)`,
      type: `max`,
      format: `currency`
    },
    // Median measures (NON-ADDITIVE - always slow)
    medianRetailPrice: {
      sql: `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY NULLIF(${CUBE}.retail_price, 0))`,
      type: `number`,
      format: `currency`
    },
    medianPromoPrice: {
      sql: `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY NULLIF(${CUBE}.promo_price, 0))`,
      type: `number`,
      format: `currency`
    },
    // Calculated measure (NON-ADDITIVE)
    averageDiscountPercentage: {
      title: "Average Discount %",
      sql: `(${CUBE.averageRetailPrice} - ${CUBE.averagePromoPrice}) / ${CUBE.averageRetailPrice}`,
      type: `number`,
      format: `percent`
    }
  },
  
  pre_aggregations: {
    // ========================================
    // EXACT MATCHES FOR CHART QUERIES
    // ========================================
    
    // EXACT match for your specific query with BOTH measures
    main: {
      measures: [averageRetailPrice, averagePromoPrice],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // This will match: prices.price_date (day) + averageRetailPrice + averagePromoPrice
      // WARNING: Non-additive measures - will be slower to build but will match exactly
    },
    
    // EXACT match for retailer chart query
    retailer_chart_match: {
      measures: [averageRetailPrice],
      dimensions: [retailers.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // This will match: retailers.name + prices.price_date (day) + averageRetailPrice
    },
    
    // EXACT match for category chart query  
    category_chart_match: {
      measures: [averageRetailPrice],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // This will match: category_groups.name + prices.price_date (day) + averageRetailPrice
    },
    
    // EXACT matches for settlement and municipality queries
    settlement_chart_match: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // This will match: settlements.name_bg + prices.price_date (day) + both averages
    },
    
    municipality_chart_match: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // This will match: municipality.name + prices.price_date (day) + both averages
    },
    
    // EXACT match for retailer price chart (both measures)
    retailer_price_chart_match: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailers.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // This will match: retailers.name + prices.price_date (day) + both averages
    },
    
    // EXACT match for category range chart (multiple measures)
    category_range_chart_match: {
      measures: [averageRetailPrice, minRetailPrice, maxRetailPrice],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // This will match: category_groups.name + prices.price_date (day) + avg/min/max
    },
    
    // EXACT match for discount chart
    discount_chart_match: {
      measures: [averageDiscountPercentage],
      dimensions: [retailers.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // This will match: retailers.name + prices.price_date (day) + discount percentage
    },
    
    // ========================================
    // ADDITIVE ALTERNATIVES (Better Performance)
    // ========================================
    
    // FAST alternative for your main query using additive measures
    main_fast: {
      measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Frontend calculates: 
      // - avgRetail = totalRetailPrice / retailPriceCount
      // - avgPromo = totalPromoPrice / promoPriceCount
      // MUCH faster to build and query!
    },
    
    // Fast retailer aggregation using additive measures
    retailer_additive: {
      measures: [totalRetailPrice, retailPriceCount],
      dimensions: [retailers.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Frontend can calculate: totalRetailPrice / retailPriceCount = average
    },
    
    // Fast category aggregation using additive measures
    category_additive: {
      measures: [totalRetailPrice, retailPriceCount],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Frontend can calculate: totalRetailPrice / retailPriceCount = average
    },
    
    // ========================================
    // BASIC STATS (No dimensions, no time)
    // ========================================
    stats_cards: {
      measures: [minRetailPrice, maxRetailPrice],
      refreshKey: {every: '4 hours'}
    },
    
    overall_totals: {
      measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
      refreshKey: {every: '4 hours'}
    },
    
    min_max_only: {
      measures: [minRetailPrice, maxRetailPrice],
      refreshKey: {every: '4 hours'}
    },
    
    median_only: {
      measures: [medianRetailPrice],
      refreshKey: {every: '4 hours'}
    },
    
    prices_average: {
      measures: [averageRetailPrice, averagePromoPrice],
      refreshKey: {every: '4 hours'}
    },
    
    // ========================================
    // VERSION 1: NO TIME DIMENSIONS (for queries without timeDimensions)
    // ========================================
    
    settlement_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      refreshKey: {every: '4 hours'}
    },
    
    municipality_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      refreshKey: {every: '4 hours'}
    },
    
    category_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [category_groups.name],
      refreshKey: {every: '4 hours'}
    },
    
    retailer_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailers.name],
      refreshKey: {every: '4 hours'}
    },
    
    retailer_discounts_no_time: {
      measures: [averageDiscountPercentage],
      dimensions: [retailers.name],
      refreshKey: {every: '4 hours'}
    },
    
    // ========================================
    // VERSION 2: ROLLUP PRE-AGGREGATIONS WITH PARTITIONING
    // ========================================
    
    // Settlement rollup with daily partitioning
    settlement_rollup: {
      type: 'rollup',
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {every: '4 hours'}
    },
    
    // Municipality rollup with daily partitioning
    municipality_rollup: {
      type: 'rollup',
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {every: '4 hours'}
    },
    
    // Category rollup with daily partitioning
    category_rollup: {
      type: 'rollup',
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {every: '4 hours'}
    },
    
    // Retailer rollup with daily partitioning
    retailer_rollup: {
      type: 'rollup',
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailers.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {every: '4 hours'}
    },
    
    // ========================================
    // VERSION 3: WEEKLY GRANULARITY (alternative time aggregation)
    // ========================================
    
    settlement_weekly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'week',
      refreshKey: {every: '4 hours'}
    },
    
    municipality_weekly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'week',
      refreshKey: {every: '4 hours'}
    },
    
    // ========================================
    // VERSION 4: MONTHLY GRANULARITY (for longer time ranges)
    // ========================================
    
    settlement_monthly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'month',
      refreshKey: {every: '4 hours'}
    },
    
    municipality_monthly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'month',
      refreshKey: {every: '4 hours'}
    },
    
    // ========================================
    // VERSION 5: SINGLE MEASURES (for trend charts)
    // ========================================
    
    settlement_retail_only: {
      measures: [averageRetailPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'}
    },
    
    municipality_retail_only: {
      measures: [averageRetailPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'}
    },
    
    // ========================================
    // EXISTING PRE-AGGREGATIONS (Keep your current ones)
    // ========================================
    
    // FAST: Category totals using additive measures
    category_totals: {
      measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'}
    },
    
    // FAST: Daily price trends using additive measures
    daily_totals: {
      measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {every: '4 hours'}
    },
    
    // LEGACY: Keep existing ones that work
    price_by_store: {
      measures: [averageRetailPrice],
      dimensions: [store_id],
      timeDimension: price_date,
      granularity: 'day'
    },
    
    // Your existing pre-aggregations (keeping the names you had)
    price_by_settlement: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'}
    },
    
    price_by_municipality: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'}
    },
    
    // For Retailer charts (Competitor Analysis)
    price_by_retailer: {
      measures: [averageRetailPrice, averagePromoPrice, averageDiscountPercentage],
      dimensions: [retailers.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'}
    },
    
    // For Category Range Chart
    price_by_category: {
      measures: [averageRetailPrice, averagePromoPrice, minRetailPrice, maxRetailPrice],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'}
    },
    
    // ========================================
    // TREND CHARTS (Time-based aggregations)
    // ========================================
    
    // For Trend Charts (all entities over time)
    retailer_trends: {
      measures: [averageRetailPrice],
      dimensions: [retailers.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {every: '2 hours'}
    },
    
    category_trends: {
      measures: [averageRetailPrice],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {every: '2 hours'}
    },
    
    municipality_trends: {
      measures: [averageRetailPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {every: '2 hours'}
    }
  }
});