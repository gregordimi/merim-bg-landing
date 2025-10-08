cube(`retailers`, {
  sql_table: `public.retailers`,
  
  data_source: `default`,
  
  joins: {
    
  },
  
  dimensions: {
    id: {
      sql: `id`,
      type: `string`,
      primary_key: true
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
    retailer_list: {
      dimensions: [name], // ✅ Use local dimension name
      refreshKey: {every: '4 hours'}
    }
  }
});
