cube(`products`, {
  sql_table: `public.products`,
  
  data_source: `default`,
  
  joins: {
    categories: {
      sql: `${CUBE}.category_id = ${categories}.original_id`,
      relationship: `many_to_one`
    }
  },
  
  dimensions: {
    original_id: {
      sql: `original_id`,
      type: `string`,
      primary_key: true
    },
    
    category_id: {
      sql: `category_id`,
      type: `number`
    },
    
    name: {
      sql: `name`,
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
