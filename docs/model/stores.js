cube(`stores`, {
  sql_table: `public.stores`,
  
  joins: {
    settlements: {
      relationship: `many_to_one`,
      sql: `${CUBE}.settlement_ekatte = ${settlements}.ekatte`
    },
    retailers: {
      relationship: `many_to_one`,
      sql: `${CUBE}.retailer_id = ${retailers}.id`
    }
  },
  
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
    retailer_id: {
      sql: `retailer_id`,
      type: `number`
    },
    settlement_ekatte: {
      sql: `settlement_ekatte`,
      type: `string`
    },
    
    // --- FIXED DIMENSIONS ---
    settlement_name: {
      // ✅ Correct: References dimension from the joined 'settlements' cube
      sql: `${settlements.name_bg}`,
      type: `string`,
      title: `Settlement Name`
    },
    
    municipality_name: {
      // ✅ Correct: Now references the new, stable dimension from 'settlements'
      sql: `${settlements.municipality_name}`, 
      type: `string`, 
      title: `Municipality Name`
    },
    
    retailer_name: {
      // ✅ Correct: References dimension from the joined 'retailers' cube
      sql: `${retailers.name}`,
      type: `string`,
      title: `Retailer Name`
    }
  },
  
  measures: {
    count: {
      type: `count`
    }
  },
  
  pre_aggregations: {
    settlement_names: {
      dimensions: [settlement_name],
      refreshKey: {every: '6 hours'}
    },
    municipality_names: {
      dimensions: [municipality_name],
      refreshKey: {every: '6 hours'}
    },
    retailer_names: {
      dimensions: [retailer_name],
      refreshKey: {every: '6 hours'}
    },
    all_store_locations: {
      dimensions: [settlement_name, municipality_name, retailer_name],
      refreshKey: {every: '6 hours'}
    }
  }
});