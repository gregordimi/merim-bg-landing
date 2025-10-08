cube(`categories`, {
  sql_table: `public.categories`,
  
  data_source: `default`,
  
  joins: {
    category_groups: {
      sql: `${CUBE}.category_group_id = ${category_groups}.original_id`,
      relationship: `many_to_one`
    }
  },
  
  dimensions: {
    original_id: {
      sql: `original_id`,
      type: `number`,
      primary_key: true
    },
    
    category_group_id: {
      sql: `category_group_id`,
      type: `number`
    },
    
    name: {
      sql: `name`,
      type: `string`
    },
    
    name_en: {
      sql: `name_en`,
      type: `string`
    },
    
    url_slug: {
      sql: `url_slug`,
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
