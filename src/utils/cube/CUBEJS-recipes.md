Documentation
Caching
Recipes
Non-additive measures
Accelerating non-additive measures
Use case
We want to run queries against pre-aggregations only to ensure our application's superior performance. Usually, accelerating a query is as simple as including its measures and dimensions to the pre-aggregation definition.

Non-additive measures (e.g., average values or distinct counts) are a special case. Pre-aggregations with such measures are less likely to be selected to accelerate a query. However, there are a few ways to work around that.

Data modeling
Let's explore the users cube that contains various measures describing users' age:

count of unique age values (distinct_ages)
average age (avg_age)
90th percentile of age (p90_age)
YAML
JavaScript
cube(`users`, {
  measures: {
    distinct_ages: {
      sql: `age`,
      type: `count_distinct`
    },
 
    avg_age: {
      sql: `age`,
      type: `avg`
    },
 
    p90_age: {
      sql: `PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY age)`,
      type: `number`
    }
  }
})

All of these measures are non-additive. Practically speaking, it means that the pre-aggregation below would only accelerate a query that fully matches its definition:

YAML
JavaScript
cube(`users`, {
  // ...
  pre_aggregations: {
    main: {
      measures: [distinct_ages, avg_age, p90_age],
      dimensions: [gender]
    }
  }
})

This query will match the pre-aggregation above and, thus, will be accelerated:

{
  "measures": ["users.distinct_ages", "users.avg_age", "users.p90_age"],
  "dimensions": ["users.gender"]
}

Meanwhile, the query below won't match the same pre-aggregation because it contains non-additive measures and omits the gender dimension. It won't be accelerated:

{
  "measures": ["users.distinct_ages", "users.avg_age", "users.p90_age"]
}

Let's explore some possible workarounds.

Replacing with approximate additive measures
Often, non-additive count_distinct measures can be changed to have the count_distinct_approx type which will make them additive and orders of magnitude more performant. This count_distinct_approx measures can be used in pre-aggregations. However, there are two drawbacks:

This type is approximate, so the measures might yield slightly different results compared to their count_distinct counterparts. Please consult with your database's documentation to learn more.
The count_distinct_approx is not supported with all databases. Currently, Cube supports it for Athena, BigQuery, and Snowflake.
For example, the distinct_ages measure can be rewritten as follows:

YAML
JavaScript
cube(`users`, {
  measures: {
    distinct_ages: {
      sql: `age`,
      type: `count_distinct_approx`
    }
  }
})

Decomposing into a formula with additive measures
Non-additive avg measures can be rewritten as calculated measures that reference additive measures only. Then, this additive measures can be used in pre-aggregations. Please note, however, that you shouldn't include avg_age measure in your pre-aggregation as it renders it non-additive.

For example, the avg_age measure can be rewritten as follows:

YAML
JavaScript
cube(`users`, {
  measures: {
    avg_age: {
      sql: `${age_sum} / ${count}`,
      type: `number`
    },
 
    age_sum: {
      sql: `age`,
      type: `sum`
    },
 
    count: {
      type: `count`
    }
  },
 
  pre_aggregations: {
    main: {
      measures: [age_sum, count],
      dimensions: [gender]
    }
  }
})

Providing multiple pre-aggregations
If the two workarounds described above don't apply to your use case, feel free to create additional pre-aggregations with definitions that fully match your queries with non-additive measures. You will get a performance boost at the expense of a slightly increased overall pre-aggregation build time and space consumed.

Source code
Please feel free to check out the full source code(opens in a new tab) or run it with the docker-compose up command. You'll see the result, including queried data, in the console.

Documentation
Caching
Recipes
Incremental pre-aggregations
Incrementally building pre-aggregations for a date range
Use case
In scenarios where a large dataset spanning multiple years is pre-aggregated with partitioning, it is often useful to only rebuild pre-aggregations between a certain date range (and therefore only a subset of all the partitions). This is because recalculating all partitions is often an expensive and/or time-consuming process.

This is most beneficial when using data warehouses with partitioning support (such as AWS Athena and Google BigQuery).

Data modeling
Let's use an example of a cube with a nested SQL query:

YAML
JavaScript
cube('users_with_organizations', {
 
  sql: `
    WITH users AS (
      SELECT
        md5(company) AS organization_id,
        id AS user_id,
        created_at
      FROM public.users
    ),
    organizations AS (
      (
        SELECT
          md5(company) AS id,
          company AS name,
          MIN(created_at)
        FROM
          public.users
        GROUP BY
          1,
          2
      )
    )
    SELECT
      users.*,
      organizations.name AS org_name
    FROM
      users
    LEFT JOIN organizations
      ON users.organization_id = organizations.id
    `,
 
  pre_aggregations: {
    main: {
      dimensions: [CUBE.id, CUBE.organization_id]
      time_dimension: CUBE.created_at,
      refresh_key: {
        every: `1 day`,
        incremental: true
      },
      granularity: `day`,
      partition_granularity: `month`,
      build_range_start: { sql: `SELECT DATE('2021-01-01')` },
      build_range_end: { sql: `SELECT NOW()` }
    }
  },
 
  dimensions: {
    id: {
      sql: `user_id`,
      type: `number`
      primary_key: true
    },
 
    organization_id: {
      sql: `organization_id`,
      type: `string`
    },
 
    created_at: {
      sql: `created_at`,
      type: `time`
    }
  }
})

The cube above pre-aggregates the results of the sql property, and is configured to incrementally build them as long as the date range is not before January 1st, 2021.

However, if we only wanted to build pre-aggregations between a particular date range within the users table, we would be unable to as the current configuration only applies the date range to the final result of the SQL query defined in sql.

In order to do the above, we'll "push down" the predicates to the inner SQL query using FILTER_PARAMS in conjunction with the build_range_start and build_range_end properties:

YAML
JavaScript
cube("users_with_organizations", {
  sql: `
WITH users AS (
    SELECT
      md5(company) AS organization_id,
      id AS user_id,
      created_at
    FROM public.users
    WHERE ${FILTER_PARAMS.users_with_organizations.created_at.filter(
      "created_at"
    )}
),
organizations AS (
  (
    SELECT
      md5(company) AS id,
      company AS name,
      MIN(created_at)
    FROM
      public.users
    GROUP BY
      1,
      2
  )
)
SELECT
  users.*,
  organizations.name AS org_name
FROM
  users
LEFT JOIN organizations
  ON users.organization_id = organizations.id
`,
 
  // ...
})

Result
By adding FILTER_PARAMS to the subquery inside the sql property, we now limit the initial size of the dataset by applying the filter as early as possible. When the pre-aggregations are incrementally built, the same filter is used to apply the build ranges as defined by build_range_start and build_range_end.

Documentation
Caching
Recipes
Disabling pre-aggregations
Disabling pre-aggregations
Use case
We want to disable pre-aggregations unless some condition is fulfilled, e.g., unless the deployment is running in a production environment.

Data modeling
You can add an environment variable and use it in data model files to enable or disable pre-aggregations.

YAML files
In YAML data model files, you can use Jinja with the built-in env_var function:

model/orders.yml
cubes:
  - name: orders
    sql_table: orders
 
    measures:
      - name: count
        type: count
    
    {% if env_var('PRE_AGGREGATIONS_ENABLED', True) %}
    pre_aggregations:
      - name: count
        measures:
          - count
    {% endif %}

JavaScript files
In JavaScript data model files, you can use JavaScript with an auxiliary file that exports your environment variable. Consider the following file structure:

.
├── env.js
└── model
    └── orders.js

env.js
module.exports = {
  pre_aggregations_enabled: process.env.PRE_AGGREGATIONS_ENABLED !== 'false'
}

model/orders.js
import { pre_aggregations_enabled } from '../env'
 
cube(`orders`, {
  sql_table: `orders`,
 
  measures: {
    count: {
      type: `count`
    }
  },
  
  pre_aggregations: pre_aggregations_enabled
    ? {
      main: {
        measures: (CUBE) => [
          `${CUBE}.count`
        ]
      }
    }
    : {}
})

Note that you will have to adjust the pre-aggregation definition to account for the context symbol transpilation. This is the reason why measures are defined as such above.

Documentation
Caching
Recipes
Using original_sql and rollup pre-aggregations effectively
Using original_sql and rollup pre-aggregations effectively
Use case
You can use the sql parameter to define cubes over arbitrary SQL queries. Sometimes, these queries might be fairly complex and take substantial time to execute. That's totally okay because you can use pre-aggregations to accelerate queries to such cubes.

However, if you have more than one pre-aggregation that references members of such a cube, its sql expression would have to be executed each time every pre-aggregation is built. This also the case if you run both pre-aggregated and non-pre-aggregated queries against such a cube.

A special original_sql pre-aggregation can help:

First, it will materialize the results of the sql expression in the data source.
Then, it will make these results available to other rollup pre-aggregations and non-pre-aggregated queries.
Configuration
We can do this by creating a pre-aggregation of type original_sql on the data source database, and then configuring our existing rollup pre-aggregations to use the original_sql pre-aggregation with the use_original_sql_pre_aggregations property.

Storing pre-aggregations on an internal database requires write-access. Please ensure that your database driver is not configured with readOnly: true.

YAML
JavaScript
cube("orders", {
  sql: `<YOUR_EXPENSIVE_SQL_QUERY HERE>`,
 
  pre_aggregations: {
    base: {
      type: `original_sql`,
      external: false
    },
 
    main: {
      dimensions: [id, name],
      measures: [count],
      time_dimension: created_at,
      granularity: `day`,
      use_original_sql_pre_aggregations: true
    }
  }
})

Result
With the above data model, the main pre-aggregation is built from the base pre-aggregation.

Documentation
Caching
Recipes
Refreshing select partitions
Refreshing select partitions
Use case
We have a dataset with orders and we want to aggregate data while having decent performance. Orders have a creation time, so we can use partitioning by time to optimize pre-aggregations build and refresh time. The problem is that the order's status can change after a long period. In this case, we want to rebuild only partitions associated with this order.

In the recipe below, we'll learn how to use the refresh_key together with the FITER_PARAMS for partition separately.

Data modeling
Let's explore the orders cube data that contains various information about orders, including number and status:

id	number	status	created_at	updated_at
1	1	processing	2021-08-10 14:26:40	2021-08-10 14:26:40
2	2	completed	2021-08-20 13:21:38	2021-08-22 13:10:38
3	3	shipped	2021-09-01 10:27:38	2021-09-02 01:12:38
4	4	completed	2021-09-20 10:27:38	2021-09-20 10:27:38
In our case, each order has created_at and updated_at properties. The updated_at property is the last order update timestamp. To create a pre-aggregation with partitions, we need to specify the partition_granularity property. Partitions will be split monthly by the created_at dimension.

YAML
JavaScript
cube(`orders`, {
  pre_aggregations: {
    orders: {
      type: `rollup`,
      dimensions: [number, status, created_at, updated_at],
      time_dimension: created_at,
      granularity: `day`,
      partition_granularity: `month`, // this is where we specify the partition
      refresh_key: {
        sql: `SELECT max(updated_at) FROM public.orders`, // check for updates of the updated_at property
      }
    }
  }
})

As you can see, we defined custom a refresh_key that will check for new values of the updated_at property. The refresh key is evaluated for each partition separately. For example, if we update orders from August and update their updated_at property, the current refresh key will update for all partitions. There is how it looks in the Cube logs:

Executing SQL: 5b4c517f-b496-4c69-9503-f8cd2b4c73b6
--
  SELECT max(updated_at) FROM public.orders
--
Performing query completed: 5b4c517f-b496-4c69-9503-f8cd2b4c73b6 (15ms)
Performing query: 5b4c517f-b496-4c69-9503-f8cd2b4c73b6
Performing query: 5b4c517f-b496-4c69-9503-f8cd2b4c73b6
Executing SQL: 5b4c517f-b496-4c69-9503-f8cd2b4c73b6
--
  select min(("orders".created_at::timestamptz AT TIME ZONE 'UTC')) from public.orders AS "orders"
--
Executing SQL: 5b4c517f-b496-4c69-9503-f8cd2b4c73b6
--
  select max(("orders".created_at::timestamptz AT TIME ZONE 'UTC')) from public.orders AS "orders"
--

Note that the query for two partitions is the same. It's the reason why all partitions will be updated.

How do we fix this and update only the partition for August? We can use the FILTER_PARAMS for that!

Let's update our pre-aggregation definition:

YAML
JavaScript
cube(`orders`, {
  pre_aggregations: {
    orders: {
      type: `rollup`,
      dimensions: [number, status, created_at, updated_at],
      time_dimension: created_at,
      granularity: `day`,
      partition_granularity: `month`,
      refresh_key: {
        sql: `
          SELECT max(updated_at)
          FROM public.orders
          WHERE ${FILTER_PARAMS.orders.created_at.filter("created_at")}`
      }
    }
  }
})

Cube will filter data by the created_at property and then apply the refresh key for the updated_at property. Here's how it looks in the Cube logs:

Executing SQL: e1155b2f-859b-4e61-a760-17af891f5f0b
--
  select min(("updated_orders".created_at::timestamptz AT TIME ZONE 'UTC')) from public.orders AS "updated_orders"
--
Executing SQL: e1155b2f-859b-4e61-a760-17af891f5f0b
--
  select max(("updated_orders".created_at::timestamptz AT TIME ZONE 'UTC')) from public.orders AS "updated_orders"
--
Performing query completed: e1155b2f-859b-4e61-a760-17af891f5f0b (10ms)
Performing query completed: e1155b2f-859b-4e61-a760-17af891f5f0b (13ms)
Performing query: e1155b2f-859b-4e61-a760-17af891f5f0b
Performing query: e1155b2f-859b-4e61-a760-17af891f5f0b
Executing SQL: e1155b2f-859b-4e61-a760-17af891f5f0b
--
  SELECT max(updated_at) FROM public.orders WHERE created_at >= '2021-08-01T00:00:00.000Z'::timestamptz AND created_at <= '2021-08-31T23:59:59.999Z'::timestamptz
--
Executing SQL: e1155b2f-859b-4e61-a760-17af891f5f0b
--
  SELECT max(updated_at) FROM public.orders WHERE created_at >= '2021-09-01T00:00:00.000Z'::timestamptz AND created_at <= '2021-09-30T23:59:59.999Z'::timestamptz

Note that Cube checks the refresh key value using a date range over the created_at property. With this refresh key, only one partition will be updated.

Result
We have received orders from two partitions of a pre-aggregation and only one of them has been updated when an order changed its status:

// orders before update:
[
  {
    "orders.number": "1",
    "orders.status": "processing",
    "orders.created_at": "2021-08-10T14:26:40.000",
    "orders.updated_at": "2021-08-10T14:26:40.000",
  },
  {
    "orders.number": "2",
    "orders.status": "completed",
    "orders.created_at": "2021-08-20T13:21:38.000",
    "orders.updated_at": "2021-08-20T13:21:38.000",
  },
  {
    "orders.number": "3",
    "orders.status": "shipped",
    "orders.created_at": "2021-09-01T10:27:38.000",
    "orders.updated_at": "2021-09-01T10:27:38.000",
  },
  {
    "orders.number": "4",
    "orders.status": "completed",
    "orders.created_at": "2021-09-20T10:27:38.000",
    "orders.updated_at": "2021-09-20T10:27:38.000",
  },
]

// orders after update:
[
  {
    "orders.number": "1",
    "orders.status": "shipped",
    "orders.created_at": "2021-08-10T14:26:40.000",
    "orders.updated_at": "2021-09-30T06:45:28.000",
  },
  {
    "orders.number": "2",
    "orders.status": "completed",
    "orders.created_at": "2021-08-20T13:21:38.000",
    "orders.updated_at": "2021-08-20T13:21:38.000",
  },
  {
    "orders.number": "3",
    "orders.status": "shipped",
    "orders.created_at": "2021-09-01T10:27:38.000",
    "orders.updated_at": "2021-09-01T10:27:38.000",
  },
  {
    "orders.number": "4",
    "orders.status": "completed",
    "orders.created_at": "2021-09-20T10:27:38.000",
    "orders.updated_at": "2021-09-20T10:27:38.000",
  },
]

Source code
Please feel free to check out the full source code(opens in a new tab) or run it with the docker-compose up command. You'll see the result, including queried data, in the console.

Documentation
Caching
Recipes
Joining data from multiple data sources
Joining data from multiple data sources
Use case
Let's imagine we store information about products and their suppliers in separate databases. We want to aggregate data from these data sources while having decent performance. In the recipe below, we'll learn how to create a rollup join between two databases to achieve our goal.

Configuration
First of all, we should define our database connections with the dataSource option in the cube.js configuration file:

module.exports = {
  driverFactory: ({ dataSource }) => {
    if (dataSource === "suppliers") {
      return {
        type: "postgres",
        database: "recipes",
        host: "demo-db-recipes.cube.dev",
        user: "cube",
        password: "12345",
        port: "5432"
      }
    }
 
    if (dataSource === "products") {
      return {
        type: "postgres",
        database: "ecom",
        host: "demo-db-recipes.cube.dev",
        user: "cube",
        password: "12345",
        port: "5432"
      }
    }
 
    throw new Error("dataSource is undefined")
  }
}

Data modeling
First, we'll define rollup pre-aggregations for products and suppliers. Note that these pre-aggregations should contain the dimension on which they're joined. In this case, it's the supplier_id dimension in the products cube, and the id dimension in the suppliers cube:

YAML
JavaScript
cube("products", {
  // ...
 
  pre_aggregations: {
    products_rollup: {
      type: `rollup`,
      dimensions: [name, supplier_id],
      indexes: {
        category_index: {
          columns: [supplier_id]
        }
      }
    }
  },
 
  joins: {
    suppliers: {
      sql: `${supplier_id} = ${suppliers.id}`,
      relationship: `many_to_one`
    }
  },
 
  // ...
})

YAML
JavaScript
cube("suppliers", {
  // ...
 
  pre_aggregations: {
    suppliers_rollup: {
      type: `rollup`,
      dimensions: [id, company, email],
      indexes: {
        category_index: {
          columns: [id]
        }
      }
    }
  }
})

Then, we'll also define a rollup_join pre-aggregation in the products cube, which will enable aggregating data from multiple data sources:

YAML
JavaScript
cube("products", {
  // ...
 
  pre_aggregations: {
    combined_rollup: {
      type: `rollup_join`,
      dimensions: [suppliers.email, suppliers.company, name],
      rollups: [suppliers.suppliers_rollup, products_rollup]
    }
  }
})

Query
Let's get the product names and their suppliers' info, such as company name and email, with the following query:

{
  "order": {
    "products.name": "asc"
  },
  "dimensions": ["products.name", "suppliers.company", "suppliers.email"],
  "limit": 3
}

Result
We'll get the data from two pre-aggregations joined into one rollup_join:

[
  {
    "products.name": "Awesome Cotton Sausages",
    "suppliers.company": "Justo Eu Arcu Inc.",
    "suppliers.email": "id.risus@luctuslobortisClass.net"
  },
  {
    "products.name": "Awesome Fresh Keyboard",
    "suppliers.company": "Quisque Purus Sapien Limited",
    "suppliers.email": "Cras@consectetuercursuset.co.uk"
  },
  {
    "products.name": "Awesome Rubber Soap",
    "suppliers.company": "Tortor Inc.",
    "suppliers.email": "Mauris@ac.com"
  }
]

Source code
Please feel free to check out the full source code(opens in a new tab) or run it with the docker-compose up command. You'll see the result, including queried data, in the console.