cube(`stores`, {
  sql_table: `public.stores`,
  
  data_source: `default`,
  
  joins: {
    retailers: {
      sql: `${CUBE}.retailer_id = ${retailers}.id`,
      relationship: `many_to_one`
    },
    
    settlements: {
      sql: `${CUBE}.settlement_ekatte = ${settlements}.ekatte`,
      relationship: `many_to_one`
    }
  },
  
  dimensions: {
    original_id: {
      sql: `original_id`,
      type: `string`,
      primary_key: true
    },
    
    address: {
      sql: `address`,
      type: `string`
    },
    
    settlement_ekatte: {
      sql: `settlement_ekatte`,
      type: `string`
    },
    
    retailer_id: {
      sql: `retailer_id`,
      type: `string`
    }
  },
  
  measures: {
    count: {
      type: `count`
    }
  },
  
  pre_aggregations: {
    // Pre-aggregation definitions go here.
    // Learn more in the documentation: https://cube.dev/docs/caching/pre-aggregations/getting-started
  }
});
