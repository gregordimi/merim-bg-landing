cube(`store_categories`, {
  sql: `
    SELECT DISTINCT 
      cg.original_id,
      cg.name,
      cg.name_en,
      cg.url_slug
    FROM category_groups cg
    JOIN categories c ON c.category_group_id = cg.original_id
    JOIN products p ON p.category_id = c.original_id  
    JOIN prices pr ON pr.product_id = p.original_id
    JOIN stores s ON s.original_id = pr.store_id
  `,
  
  dimensions: {
    original_id: {
      sql: `original_id`,
      type: `number`,
      primary_key: true
    },
    name: {
      sql: `name`,
      type: `string`,
      title: `Category Name`
    },
    name_en: {
      sql: `name_en`,
      type: `string`,
      title: `Category Name (English)`
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
    // Categories that are available in stores (have prices)
    available_categories: {
      dimensions: [name],
      refreshKey: {every: '6 hours'},
      // Returns only categories that have products with prices in stores
    }
  }
});