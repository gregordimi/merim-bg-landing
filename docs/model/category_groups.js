cube(`category_groups`, {
  sql_table: `public.category_groups`,
  data_source: `default`,
  joins: {},
  dimensions: {
    original_id: {
      sql: `original_id`,
      type: `number`,
      primary_key: true
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
    category_group_names: {
      dimensions: [name], // ✅ Use local dimension name
      refreshKey: {every: '4 hours'}
    }
  }
});