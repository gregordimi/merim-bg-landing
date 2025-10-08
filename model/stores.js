cube(`stores`, {
  sql_table: `public.stores`,
  
  joins: {
    // Correct: Joins to settlements, which then joins to municipality
    settlements: {
      relationship: `many_to_one`,
      sql: `${CUBE}.settlement_ekatte = ${settlements}.ekatte`
    },
    // REMOVED: The incorrect direct join to municipality that was causing the error.
    
    // Correct: This join is fine
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
    
    // Direct settlement and municipality names for filter dropdowns
    settlement_name: {
      // ✅ This correctly references the joined settlements cube
      sql: `${settlements.name_bg}`,
      type: `string`,
      title: `Settlement Name`
    },
    
    municipality_name: {
      // ✅ FIXED: This now correctly references municipality through the settlements join
      sql: `${settlements.municipality.name}`, 
      type: `string`, 
      title: `Municipality Name`
    },
    
    retailer_name: {
      // ✅ This correctly references the joined retailers cube
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
    // Filter value pre-aggregations for dropdowns
    settlement_names: {
      dimensions: [settlement_name],
      refreshKey: {every: '12 hour'},
    },
    
    municipality_names: {
      dimensions: [municipality_name],
      refreshKey: {every: '12 hour'},
    },
    
    retailer_names: {
      dimensions: [retailer_name],
      refreshKey: {every: '12 hour'},
    },
    
    // Combined for complex filtering
    // This pre-aggregation will now build correctly with the fixed join path
    all_store_locations: {
      dimensions: [settlement_name, municipality_name, retailer_name],
      refreshKey: {every: '12 hour'},
    }
  }
});