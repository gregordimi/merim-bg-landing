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
    },
    
    // --- FIXED DIMENSIONS: Replaced subqueries with joins for performance ---
    retailer_name: {
      sql: `${stores.retailer_name}`,
      type: `string`,
      title: `Retailer Name`
    },
    
    settlement_name: {
      sql: `${stores.settlement_name}`,
      type: `string`,
      title: `Settlement Name`
    },
    
    municipality_name: {
      sql: `${stores.municipality_name}`,
      type: `string`,
      title: `Municipality Name`
    },
    
    category_group_name: {
      sql: `${products.categories.category_groups.name}`,
      type: `string`,
      title: `Category Group Name`
    }
  },
  measures: {
    count: {
      type: `count`
    },
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
    averageDiscountPercentage: {
      title: "Average Discount %",
      sql: `(${CUBE.averageRetailPrice} - ${CUBE.averagePromoPrice}) / ${CUBE.averageRetailPrice}`,
      type: `number`,
      format: `percent`
    }
  },
  pre_aggregations: {
    retailer_chart_match: {
      measures: [averageRetailPrice],
      dimensions: [retailer_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '12 hour'
      }
    },
    category_chart_match: {
      measures: [averageRetailPrice],
      dimensions: [category_group_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '12 hour'
      }
    },
    universal_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [
        retailer_name,
        settlement_name,
        municipality_name,
        category_group_name
      ],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '12 hour'},
    },
    retailer_category_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailer_name, category_group_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '12 hour'},
    },
    location_category_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlement_name, category_group_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '12 hour'},
    },
    retailer_location_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailer_name, settlement_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '12 hour'},
    },
    retailer_only_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailer_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '12 hour'},
    },
    settlement_only_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlement_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '12 hour'},
    },
    municipality_only_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '12 hour'},
    },
    category_only_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [category_group_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '12 hour'},
    },
    time_only_filtered: {
      measures: [averageRetailPrice, averagePromoPrice],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '12 hour'},
    },
    no_time_all_filters: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailer_name, settlement_name, category_group_name],
      refreshKey: {every: '12 hour'},
    },
    retailer_values: {
      dimensions: [retailer_name],
      refreshKey: {every: '12 hour'},
    },
    location_values: {
      dimensions: [settlement_name],
      refreshKey: {every: '12 hour'},
    },
    category_values: {
      dimensions: [category_group_name],
      refreshKey: {every: '12 hour'},
    },
    all_filter_values: {
      dimensions: [retailer_name, settlement_name, category_group_name],
      refreshKey: {every: '12 hour'},
    },
    retailer_additive: {
      measures: [totalRetailPrice, retailPriceCount],
      dimensions: [retailer_name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '12 hour'
      }
    },
    category_additive: {
      measures: [totalRetailPrice, retailPriceCount],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '12 hour'
      }
    },
    stats_cards: {
      measures: [minRetailPrice, maxRetailPrice],
      refreshKey: {
        every: '12 hour'
      }
    },
    overall_totals: {
      measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
      refreshKey: {
        every: '12 hour'
      }
    },
    overall_totals_2: {
      measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {every: '12 hour'},
    },
    min_max_only: {
      measures: [minRetailPrice, maxRetailPrice],
      refreshKey: {
        every: '12 hour'
      }
    },
    median_only: {
      measures: [medianRetailPrice],
      refreshKey: {
        every: '12 hour'
      }
    },
    prices_average: {
      measures: [averageRetailPrice, averagePromoPrice],
      refreshKey: {
        every: '12 hour'
      }
    },
    settlement_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      refreshKey: {
        every: '12 hour'
      }
    },
    municipality_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      refreshKey: {
        every: '12 hour'
      }
    },
    category_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [category_groups.name],
      refreshKey: {
        every: '12 hour'
      }
    },
    retailer_no_time: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailers.name],
      refreshKey: {
        every: '12 hour'
      }
    },
    retailer_discounts_no_time: {
      measures: [averageDiscountPercentage],
      dimensions: [retailers.name],
      refreshKey: {
        every: '12 hour'
      }
    },
    settlement_rollup: {
      type: 'rollup',
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {
        every: '12 hour'
      }
    },
    municipality_rollup: {
      type: 'rollup',
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {
        every: '12 hour'
      }
    },
    category_rollup: {
      type: 'rollup',
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {
        every: '12 hour'
      }
    },
    retailer_rollup: {
      type: 'rollup',
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [retailers.name],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {
        every: '12 hour'
      }
    },
    settlement_weekly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'week',
      refreshKey: {
        every: '12 hour'
      }
    },
    municipality_weekly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'week',
      refreshKey: {
        every: '12 hour'
      }
    },
    settlement_monthly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'month',
      refreshKey: {
        every: '12 hour'
      }
    },
    municipality_monthly: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'month',
      refreshKey: {
        every: '12 hour'
      }
    },
    settlement_retail_only: {
      measures: [averageRetailPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '12 hour'
      }
    },
    municipality_retail_only: {
      measures: [averageRetailPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '12 hour'
      }
    },
    category_totals: {
      measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '12 hour'
      }
    },
    daily_totals: {
      measures: [totalRetailPrice, totalPromoPrice, retailPriceCount, promoPriceCount],
      timeDimension: price_date,
      granularity: 'day',
      partitionGranularity: 'month',
      refreshKey: {
        every: '12 hour'
      }
    },
    price_by_store: {
      measures: [averageRetailPrice],
      dimensions: [store_id],
      timeDimension: price_date,
      granularity: 'day'
    },
    price_by_settlement: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [settlements.name_bg],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '12 hour'
      }
    },
    price_by_municipality: {
      measures: [averageRetailPrice, averagePromoPrice],
      dimensions: [municipality.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '12 hour'
      }
    },
    price_by_retailer: {
      measures: [averageRetailPrice, averagePromoPrice, averageDiscountPercentage],
      dimensions: [retailers.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '12 hour'
      }
    },
    price_by_category: {
      measures: [averageRetailPrice, averagePromoPrice, minRetailPrice, maxRetailPrice],
      dimensions: [category_groups.name],
      timeDimension: price_date,
      granularity: 'day',
      refreshKey: {
        every: '12 hour'
      }
    },
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
      measures: [averageRetailPrice, averagePromoPrice],
      timeDimension: price_date,
      granularity: `day`
    },
    average_price_promo_day: {
      measures: [averageRetailPrice, averagePromoPrice],
      timeDimension: price_date,
      granularity: `day`
    }
  }
});