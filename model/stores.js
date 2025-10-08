cube(`stores`, {
  sql_table: `public.stores`,
  
  joins: {
    settlements: {
      relationship: `many_to_one`,
      sql: `${CUBE}.settlement_ekatte = ${settlements}.ekatte`
    },
    municipality: {
      relationship: `many_to_one`,
      sql: `${CUBE}.settlement_ekatte = ${settlements}.ekatte AND ${settlements}.municipality = ${municipality}.code`
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
    
    // Direct settlement and municipality names for filter dropdowns
    settlement_name: {
      sql: `${settlements.name_bg}`,
      type: `string`,
      title: `Settlement Name`
    },
    
    municipality_name: {
      sql: `${municipality.name}`,
      type: `string`, 
      title: `Municipality Name`
    },
    
    retailer_name: {
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
      refreshKey: {every: '6 hours'},
      // Returns only settlements that have stores
    },
    
    municipality_names: {
      dimensions: [municipality_name],
      refreshKey: {every: '6 hours'},
      // Returns only municipalities that have stores
    },
    
    retailer_names: {
      dimensions: [retailer_name],
      refreshKey: {every: '6 hours'},
      // Returns only retailers that have stores
    },
    
    // Combined for complex filtering
    all_store_locations: {
      dimensions: [settlement_name, municipality_name, retailer_name],
      refreshKey: {every: '6 hours'},
      // All location combinations that have stores
    }
  }
});