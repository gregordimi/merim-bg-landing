cube(`settlements`, {
  sql_table: `public.settlements`,
  data_source: `default`,

  joins: {
    municipality: {
      sql: `${CUBE}.municipality = ${municipality}.code`, // ✅ Fixed syntax
      relationship: `many_to_one`
    },
    stores: {
      relationship: `one_to_many`,
      sql: `${CUBE}.ekatte = ${stores}.settlement_ekatte`
    }
  },

  dimensions: {
    ekatte: {
      sql: `ekatte`,
      type: `string`,
      primary_key: true
    },
    area: {
      sql: `area`,
      type: `number`
    },
    population: {
      sql: `population`,
      type: `number`
    },
    name_bg: {
      sql: `name_bg`,
      type: `string`
    },
    name_en: {
      sql: `name_en`,
      type: `string`
    },
    municipality: {
      sql: `municipality`,
      type: `string`
    }
  },
  measures: {
    count: {
      type: `count`
    }
  },
  pre_aggregations: {
    settlements_basic: {
      dimensions: [name_bg], // ✅ Use local dimension names only
      refreshKey: {every: '4 hours'}
    }
  }
});