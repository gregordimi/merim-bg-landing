cube(`prices`, {
  sql_table: `public.prices`,
  joins: {
    // SIMPLIFIED: Only direct joins to base tables
    stores: {
      relationship: `many_to_one`,
      sql: `${CUBE}.store_id = ${stores}.original_id`
    },
    products: {
      relationship: `many_to_one`,
      sql: `${CUBE}.product_id = ${products}.original_id`
    }
    
    // REMOVED: Complex multi-table joins that cause loops
    // Instead, we'll use subqueries in dimensions below
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
    },
    
    // FLATTENED DIMENSIONS (using subqueries to avoid join loops)
    retailer_name: {
      sql: `(
        SELECT r.name 
        FROM retailers r 
        JOIN stores s ON s.retailer_id = r.id 
        WHERE s.original_id = ${CUBE}.store_id
      )`,
      type: `string`,
      title: `Retailer Name`
    },
    
    settlement_name: {
      sql: `(
        SELECT st.name_bg 
        FROM settlements st 
        JOIN stores s ON s.settlement_ekatte = st.ekatte 
        WHERE s.original_id = ${CUBE}.store_id
      )`,
      type: `string`,
      title: `Settlement Name`
    },
    
    municipality_name: {
      sql: `(
        SELECT m.name 
        FROM municipality m 
        JOIN settlements st ON st.municipality = m.code 
        JOIN stores s ON s.settlement_ekatte = st.ekatte 
        WHERE s.original_id = ${CUBE}.store_id
      )`,
      type: `string`,
      title: `Municipality Name`
    },
    
    category_group_name: {
      sql: `(
        SELECT cg.name 
        FROM category_groups cg 
        JOIN categories c ON c.category_group_id = cg.original_id 
        JOIN products p ON p.category_id = c.original_id 
        WHERE p.original_id = ${CUBE}.product_id
      )`,
      type: `string`,
      title: `Category Group Name`
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

    // EXACT match for retailer chart query
    retailer_chart_match: {
      measures: [averageRetailPrice],
      dimensions: [retailer_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '4 hours'
      }
      // This will match: prices.retailer_name + prices.price_date (day) + averageRetailPrice
    },
    // EXACT match for category chart query  
    category_chart_match: {
      measures: [averageRetailPrice],
      dimensions: [category_group_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '4 hours'
      }
      // This will match: prices.category_group_name + prices.price_date (day) + averageRetailPrice
    },
    // ========================================
    // FILTERED PRE-AGGREGATIONS (For Dashboard Filters)
    // ========================================
    
    // Universal filtered pre-aggregation - supports ALL filter combinations
    universal_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [
        retailer_name,        // For retailer filters
        settlement_name,      // For settlement filters
        municipality_name,    // For municipality filters
        category_group_name   // For category filters
      ],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // This matches queries with ANY combination of retailer/settlement/municipality/category filters
      // as long as the filtered dimensions are included in the query dimensions
    },
    
    // Retailer + Category combination (common filter pattern)
    retailer_category_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailer_name, category_group_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Matches: retailer + category filters together
    },
    
    // Location + Category combination
    location_category_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlement_name, category_group_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Matches: location + category filters together
    },
    
    // Retailer + Location combination
    retailer_location_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailer_name, settlement_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Matches: retailer + location filters together
    },
    
    // Single filter pre-aggregations (fastest)
    retailer_only_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailer_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Matches: retailer filter only
    },
    
    settlement_only_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlement_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Matches: settlement filter only
    },
    
    municipality_only_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Matches: municipality filter only
    },
    
    category_only_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [category_group_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Matches: category filter only
    },
    
    // Time-only queries (no other filters)
    time_only_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Matches: time filter only (no other dimensions)
    },
    
    // No time dimension queries (all filters but no time)
    no_time_all_filters: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailer_name, settlement_name, category_group_name],
      refreshKey: {every: '4 hours'},
      // Matches: all filters but NO time dimension
    },

    // ========================================
    // FILTER VALUE PRE-AGGREGATIONS (For dropdown population)
    // ========================================
    
    // Individual filter value lists (no measures, no time)
    retailer_values: {
      dimensions: [retailer_name],
      refreshKey: {every: '6 hours'},
      // Matches: queries that fetch retailer list for dropdowns
    },
    
    location_values: {
      dimensions: [settlement_name],
      refreshKey: {every: '6 hours'},
      // Matches: queries that fetch location list for dropdowns
    },
    
    category_values: {
      dimensions: [category_group_name],
      refreshKey: {every: '6 hours'},
      // Matches: queries that fetch category list for dropdowns
    },
    
    // All filter values combined (for complex dropdown logic)
    all_filter_values: {
      dimensions: [retailer_name, settlement_name, category_group_name],
      refreshKey: {every: '6 hours'},
      // Matches: queries that fetch all filter combinations
    },

    // ========================================
    // ADDITIVE ALTERNATIVES (Better Performance)
    // ========================================

    // Fast retailer aggregation using additive measures
    retailer_additive: {
      measures: [totalRetailPrice, retailPriceCount],
      dimensions: [retailer_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '4 hours'
      }
      // Frontend can calculate: totalRetailPrice / retailPriceCount = average
    },
    // Fast category aggregation using additive measures
    category_additive: {
      measures: [totalRetailPrice, retailPriceCount],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '4 hours'
      }
      // Frontend can calculate: totalRetailPrice / retailPriceCount = average
    },
    // ========================================
    // BASIC STATS (No dimensions, no time)
    // ========================================
    stats_cards: {
      measures: [minRetailPrice, maxRetailPrice],
      refreshKey: {
        every: '4 hours'
      }
    },
    overall_totals: {
      measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
      refreshKey: {
        every: '4 hours'
      }
    },

        // FAST alternative for your main query using additive measures
    overall_totals_2: {
      measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '4 hours'},
      // Frontend calculates: 
      // - avgRetail = totalRetailPrice / retailPriceCount
      // - avgPromo = totalPromoPrice / promoPriceCount
      // MUCH faster to build and query!
    },

    min_max_only: {
      measures: [minRetailPrice, maxRetailPrice],
      refreshKey: {
        every: '4 hours'
      }
    },
    median_only: {
      measures: [medianRetailPrice],
      refreshKey: {
        every: '4 hours'
      }
    },
    prices_average: {
      measures: [averageRetailPrice, averagePromoPrice],
      refreshKey: {
        every: '4 hours'
      }
    },
    // ========================================
    // VERSION 1: NO TIME DIMENSIONS (for queries without timeDimensions)
    // ========================================

    settlement_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      refreshKey: {
        every: '4 hours'
      }
    },
    municipality_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      refreshKey: {
        every: '4 hours'
      }
    },
    category_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [category_groups.name],
      refreshKey: {
        every: '4 hours'
      }
    },
    retailer_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailers.name],
      refreshKey: {
        every: '4 hours'
      }
    },
    retailer_discounts_no_time: {
      measures: [averageDiscountPercentage],
      dimensions: [retailers.name],
      refreshKey: {
        every: '4 hours'
      }
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
      refreshKey: {
        every: '4 hours'
      }
    },
    // Municipality rollup with daily partitioning
    municipality_rollup: {
      type: 'rollup',
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {
        every: '4 hours'
      }
    },
    // Category rollup with daily partitioning
    category_rollup: {
      type: 'rollup',
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {
        every: '4 hours'
      }
    },
    // Retailer rollup with daily partitioning
    retailer_rollup: {
      type: 'rollup',
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailers.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {
        every: '4 hours'
      }
    },
    // ========================================
    // VERSION 3: WEEKLY GRANULARITY (alternative time aggregation)
    // ========================================

    settlement_weekly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'week',
      refreshKey: {
        every: '4 hours'
      }
    },
    municipality_weekly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'week',
      refreshKey: {
        every: '4 hours'
      }
    },
    // ========================================
    // VERSION 4: MONTHLY GRANULARITY (for longer time ranges)
    // ========================================

    settlement_monthly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'month',
      refreshKey: {
        every: '4 hours'
      }
    },
    municipality_monthly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'month',
      refreshKey: {
        every: '4 hours'
      }
    },
    // ========================================
    // VERSION 5: SINGLE MEASURES (for trend charts)
    // ========================================

    settlement_retail_only: {
      measures: [averageRetailPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '4 hours'
      }
    },
    municipality_retail_only: {
      measures: [averageRetailPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '4 hours'
      }
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
      refreshKey: {
        every: '4 hours'
      }
    },
    // FAST: Daily price trends using additive measures
    daily_totals: {
      measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {
        every: '4 hours'
      }
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
      refreshKey: {
        every: '4 hours'
      }
    },
    price_by_municipality: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '4 hours'
      }
    },
    // For Retailer charts (Competitor Analysis)
    price_by_retailer: {
      measures: [averageRetailPrice, averagePromoPrice, averageDiscountPercentage],
      dimensions: [retailers.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '4 hours'
      }
    },
    // For Category Range Chart
    price_by_category: {
      measures: [averageRetailPrice, averagePromoPrice, minRetailPrice, maxRetailPrice],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '4 hours'
      }
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
      refreshKey: {
        every: '2 hours'
      }
    },
    category_trends: {
      measures: [averageRetailPrice],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {
        every: '2 hours'
      }
    },
    municipality_trends: {
      measures: [averageRetailPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {
        every: '2 hours'
      }
    },
    price_trend_non_add: {
      measures: [prices.averageRetailPrice, prices.averagePromoPrice],
      timeDimension: prices.price_date,
      granularity: `day`
    },
    average_price_promo_day: {
      measures: [prices.averageRetailPrice, prices.averagePromoPrice],
      timeDimension: prices.price_date,
      granularity: `day`
    }
  }
});