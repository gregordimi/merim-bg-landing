cube(`settlements`, {
  sql_table: `public.settlements`,
  data_source: `default`,

  joins: {
    municipality: {
      sql: `${CUBE}.municipality = ${municipality}.code`,
      relationship: `many_to_one`
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
    
    // ✅ THIS IS THE KEY FIX:
    // Create a dimension here so other cubes can reference it easily.
    municipality_name: {
      sql: `${municipality.name}`,
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
      dimensions: [name_bg],
      refreshKey: {every: '4 hours'}
    }
  }
});