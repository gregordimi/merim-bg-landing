cube(`municipality`, {
  sql_table: `public.municipality`,
  data_source: `default`,
  
  joins: {},
  
  dimensions: {
    code: {
      sql: `code`,
      type: `string`,
      primary_key: true
    },
    name: {
      sql: `name`,
      type: `string`
    },
    ekatte: {
      sql: `ekatte`,
      type: `string`
    }
  },
  
  measures: {
    count: {
      type: `count`
    }
  },
  
  pre_aggregations: {
    municipality_basic: {
      dimensions: [name],
      refreshKey: {every: '4 hours'}
    }
  }
});