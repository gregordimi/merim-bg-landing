Documentation
Caching
Getting started with pre-aggregations
Getting started with pre-aggregations
Often at the beginning of an analytical application's lifecycle - when there is a smaller dataset that queries execute over - the application works well and delivers responses within acceptable thresholds. However, as the size of the dataset grows, the time-to-response from a user's perspective can often suffer quite heavily. This is true of both application and purpose-built data warehousing solutions.

This leaves us with a chicken-and-egg problem; application databases can deliver low-latency responses with small-to-large datasets, but struggle with massive analytical datasets; data warehousing solutions usually make no guarantees except to deliver a response, which means latency can vary wildly on a query-to-query basis.

Database Type	Low Latency?	Massive Datasets?
Application (Postgres/MySQL)	✅	❌
Analytical (BigQuery/Redshift)	❌	✅
Cube provides a solution to this problem: pre-aggregations. In layman's terms, a pre-aggregation is a condensed version of the source data. It specifies attributes from the source, which Cube uses to condense (or crunch) the data. This simple yet powerful optimization can reduce the size of the dataset by several orders of magnitude, and ensures subsequent queries can be served by the same condensed dataset if any matching attributes are found.

Pre-aggregations are defined within each cube's data model, and cubes can have as many pre-aggregations as they require. The pre-aggregated data is stored in Cube Store, a dedicated pre-aggregation storage layer.

Pre-Aggregations without Time Dimension
To illustrate pre-aggregations with an example, let's use a sample e-commerce database. We have a data model representing all our orders:

YAML
JavaScript
cube(`orders`, {
  sql_table: `orders`,
 
  measures: {
    count: {
      type: `count`
    }
  },
 
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true
    },
 
    status: {
      sql: `status`,
      type: `string`
    },
 
    completed_at: {
      sql: `completed_at`,
      type: `time`
    }
  }
})

Some sample data from this table might look like:

id	status	completed_at
1	completed	2021-02-15T12:21:11.290
2	completed	2021-02-25T18:15:12.369
3	shipped	2021-03-15T20:40:57.404
4	processing	2021-03-13T10:30:21.360
5	completed	2021-03-10T18:25:32.109
Our first requirement is to populate a dropdown in our front-end application which shows all possible statuses. The Cube query to retrieve this information might look something like:

{
  "dimensions": ["orders.status"]
}

In that case, we can add the following pre-aggregation to the orders cube:

YAML
JavaScript
cube(`orders`, {
  // ...
 
  pre_aggregations: {
    order_statuses: {
      dimensions: [status]
    }
  }
})

Pre-Aggregations with Time Dimension
Using the same data model as before, we are now finding that users frequently query for the number of orders completed per day, and that this query is performing poorly. This query might look something like:

{
  "measures": ["orders.count"],
  "timeDimensions": ["orders.completed_at"]
}

In order to improve the performance of this query, we can add another pre-aggregation definition to the orders cube:

YAML
JavaScript
cube(`orders`, {
  // ...
 
  pre_aggregations: {
    orders_by_completed_at: {
      measures: [count],
      time_dimension: completed_at,
      granularity: `month`
    }
  }
})

Note that we have added a granularity property with a value of month to this definition. This allows Cube to aggregate the dataset to a single entry for each month.

The next time the API receives the same JSON query, Cube will build (if it doesn't already exist) the pre-aggregated dataset, store it in the source database server and use that dataset for any subsequent queries. A sample of the data in this pre-aggregated dataset might look like:

completed_at	count
2021-02-01T00:00:00.000	2
2021-03-01T00:00:00.000	3
Keeping pre-aggregations up-to-date
Pre-aggregations can become out-of-date or out-of-sync if the original dataset changes. Cube uses a refresh key to check the freshness of the data; if a change in the refresh key is detected, the pre-aggregations are rebuilt. These refreshes are performed in the background as a scheduled process, unless configured otherwise.

Documentation
Caching
Using pre-aggregations
Using pre-aggregations
Pre-aggregations is an implementation of aggregate awareness in Cube. Pre-aggregation tables are materialized query results. Cube can analyze queries against a defined set of pre-aggregation rules to choose the optimal one that will be used to serve a given Cube query instead of going to the data source.

If Cube finds a suitable pre-aggregation rule, database querying becomes a multi-stage process:

Cube checks if an up-to-date copy of the pre-aggregation exists.

Cube will execute a query against the pre-aggregated tables instead of the raw data.

Pre-aggregations is a powerful way to speed up your Cube queries. There are many configuration options to consider. Please make sure to check the configuration reference.

Matching queries
When executing a query, Cube will try to match and fulfill it with a pre-aggregation in the first place.

If there's no matching pre-aggregation, Cube will query the upstream data source instead, unless the rollup-only mode is enabled.

Rollup-only mode
In the rollup-only mode, Cube will only fulfill queries using pre-aggregations. To enable the rollup-only mode, use the CUBEJS_ROLLUP_ONLY environment variable.

It can be useful to prevent queries from your end users from ever hitting the upstream data source, e.g., if you prefer to use your data warehouse only to build and refresh pre-aggregations and keep it suspended the rest of the time.

When the rollup-only mode is used with a single-node deployment (where the API instance also serves as a refresh worker), queries that can't be fulfilled with pre-aggregations will result in an error. Scheduled refreshes will continue to work in the background.

Refresh strategy
Refresh strategy can be customized by setting the refresh_key property for the pre-aggregation.

The default value of refresh_key is every: 1 hour, if neither of the cubes overrides it's refreshKey parameter. It can be redefined either by overriding the default value of the every property:

YAML
JavaScript
cube(`orders`, {
  // ...
 
  pre_aggregations: {
    amount_by_created: {
      type: `rollup`,
      measures: [amount],
      time_dimension: created_at,
      granularity: `month`,
      refresh_key: {
        every: `12 hour`
      }
    }
  }
})

Or by providing a sql property instead, and leaving every unchanged from its default value:

YAML
JavaScript
cube(`orders`, {
  // ...
 
  pre_aggregations: {
    amount_by_created: {
      measures: [amount],
      time_dimension: created_at,
      granularity: `month`,
      refresh_key: {
        // every will default to `10 seconds` here
        sql: `SELECT MAX(created_at) FROM orders`
      }
    }
  }
})

Or both every and sql can be defined together:

YAML
JavaScript
cube(`orders`, {
  // ...
 
  pre_aggregations: {
    amount_by_created: {
      measures: [amount],
      time_dimension: created_at,
      granularity: `month`,
      refresh_key: {
        every: `12 hour`,
        sql: `SELECT MAX(created_at) FROM orders`
      }
    }
  }
})

When every and sql are used together, Cube will run the query from the sql property on an interval defined by the every property. If the query returns new results, then the pre-aggregation will be refreshed.

Partitioning
Partitioning(opens in a new tab) is an extremely effective optimization for accelerating pre-aggregations build and refresh time. It effectively "shards" the data between multiple tables, splitting them by a defined attribute.

Cube can be configured to incrementally refresh only the last set of partitions through the updateWindow property. This leads to faster refresh times due to unnecessary data not being reloaded, and even reduced cost for some databases like BigQuery or AWS Athena.

See this recipe for an example of optimized incremental refresh.

Any rollup pre-aggregation can be partitioned by time using the partition_granularity property in a pre-aggregation definition. In the example below, the partition_granularity is set to month, which means Cube will generate separate tables for each month's worth of data. Once built, it will continue to refresh on a daily basis the last 3 months of data.

YAML
JavaScript
cube(`orders`, {
  // ...
 
  preAggregations: {
    category_and_date: {
      measures: [count, revenue],
      dimensions: [category],
      time_dimension: created_at,
      granularity: `day`,
      partition_granularity: `month`,
      refresh_key: {
        every: `1 day`,
        incremental: true,
        update_window: `3 months`
      }
    }
  }
})

Partitioning by non-time dimension
Cube Store uses an auto-partitioning technique to split Cube logical partitions into multiple physical ones. The partitioning key is the same as the sorting key of an index. Every physical partition is stored as a separate parquet file. Split is performed based on underlying parquet file sizes and rows inside those files. So simplest way to ensure proper partitioning is to introduce an index. For bigger pre-aggregations first columns of an index will determine the partitioning scheme. An interesting consequence of having time dimension partitioning enabled with an index is data partitioned by time and then by sorting the key of an index. It leads to that even in case of optimal index in place querying time is proportional to count of involved time partitions. This issue can be addressed by lambda pre-aggregations.

Alternatively, if you want to explicitly introduce key partitioning, you can use multi-tenancy to introduce multiple orchestrator IDs. Each orchestrator ID can use a different pre-aggregation schema, so you may define those based on the partitioning key you want to introduce. This technique, together with multi-router Cube Store approach, allows you to achieve linear scaling on the partitioning key of your choice.

Best practices
In general, it's better to lean towards less partitions, as long as you are satisfied with query speed.

For optimal querying performance, partitions should be small enough so that the Cube Store workers can process them in less than 100 milliseconds. The best way to optimize this is to start from a relatively large partition (e.g., yearly or no partition at all if data permits), check what the flame graph in Query History shows, then iterate as needed.

For optimal pre-aggregation build performance, you would optimize partition size together with pre-aggregation build concurrency and build time. Smaller partitions with high concurrency would incur significant overhead. For optimal build performance, having 1 Cube Store worker per partition is ideal. However, Cube Store workers can handle up to 4 partitions per worker conucrrently. Since Cube Store workers often max out at 16, this means you should avoid having more than 64 partitions. Any additional partitions would be queued. Keep in mind that indexes essentially multiply the number of partitions that are created, so for example, if you have two indexes, you would want to avoid having more than 32 partitions to avoid queueing. The best way to optimize this is to make refresh keys as infrequent as possible and then use the Build History tab to check build times, along with the Performance Insights page to monitor Cube Store workers load, and iterate as needed.

Using indexes
Indexes are sorted copies of pre-aggregation data.

When you define a pre-aggregation without any explicit indexes, the default index is created. In this index, dimensions come first, time dimensions come second.

When you define additional indexes, you don't incur any additional costs on the data warehouse side. However, the pre-aggregation build time for a particular pre-aggregation increases with each index because all indexes for pre-aggregation are built during ingestion time.

When to use indexes?
At query time, if the default index can't be selected for a merge sort scan, then a less performant hash aggregation would be used. It usually means that the full table needs to be scanned to get query results.

It usually doesn't make much difference if the pre-aggregation table is only several MBs in size. However, for larger pre-aggregations, indexes are usually required to achieve optimal performance, especially if not all dimensions from a pre-aggregation are used in a particular query.

Best practices
Most pre-aggregations represent additive rollups. For such rollups, the rule of thumb is that, for most queries, there should be at least one index that makes a particular query scan very little amount of data, which makes it very fast. (There are exceptions to this rule like top-k queries or queries with only low selectivity range filters. Optimization for these use cases usually involves remodeling data and queries.)

To maximize performance, you can introduce an index per each query type so that the set of dimensions used in a query overlaps as much as possible with the set of dimensions in the index. Measures are usually only used in indexes if you plan to filter on a measure value and the cardinality of the possible values of the measure is low.

The order in which dimensions are specified in the index is very important; suboptimal ordering can lead to diminished performance. To improve the performance of an index the main thing to consider is its order of dimensions. The rule of thumb for dimension order is as follows:

Dimensions used in high selectivity, single-value filters come first.
Dimensions used in GROUP BY come second.
Everything else used in the query comes in the end, including dimensions used in low selectivity, multiple-value filters.
It might sound counter-intuitive to have dimensions used in GROUP BY before dimensions used in multiple-value filters. However, Cube Store always performs scans on sorted data, and if GROUP BY matches index ordering, merge sort-based algorithms are used for querying, which are usually much faster than hash-based GROUP BY in case index ordering doesn't match the query.

If in doubt, always use EXPLAIN and EXPLAIN ANALYZE to figure out the final query plan.

Example
Suppose you have a pre-aggregation that has millions of rows and the following structure:

timestamp	product_name	product_category	zip_code	order_total
2023-01-01 10:00:00	Keyboard	Electronics	88523	1000
2023-01-01 10:00:00	Mouse	Electronics	88523	800
2023-01-01 10:00:00	Plastic Chair	Furniture	88523	2000
2023-01-01 11:00:00	Keyboard	Electronics	88524	2000
2023-01-01 11:00:00	Plastic Chair	Furniture	88524	3000
The pre-aggregation definition looks as follows:

YAML
JavaScript
cube("orders", {
  // ...
 
  pre_aggregations: {
    main: {
      measures: [order_total],
      dimensions: [product_name, product_category, zip_code],
      time_dimension: timestamp,
      granularity: `hour`,
      partition_granularity: `day`,
      allow_non_strict_date_range_match: true,
      refresh_key: {
        every: `1 hour`,
        incremental: true,
        update_window: `1 day`
      },
      build_range_start: {
        sql: `SELECT DATE_SUB(NOW(), 365)`
      },
      build_range_end: {
        sql: `SELECT NOW()`
      }
    }
  }
})

You run the following query on a regular basis, with the only difference between queries being the filter values:

{
  "measures": [
    "orders.order_total"
  ],
  "timeDimensions": [
    {
      "dimension": "orders.timestamp",
      "granularity": "hour",
      "dateRange": [
        "2022-12-14T06:00:00.000",
        "2023-01-13T06:00:00.000"
      ]
    }
  ],
  "order": {
    "orders.timestamp": "asc"
  },
  "filters": [
    {
      "member": "orders.product_category",
      "operator": "equals",
      "values": [
        "Electronics"
      ]
    },
    {
      "member": "orders.product_name",
      "operator": "equals",
      "values": [
        "Keyboard",
        "Mouse"
      ]
    }
  ],
  "dimensions": [
    "orders.zip_code"
  ],
  "limit": 10000
}

After running this query on a dataset with millions of records you find that it's taking too long to run, so you decide to add an index to target this specific query. Taking into account the best practices, you should define an index as follows:

YAML
JavaScript
cube(`orders`, {
  // ...
 
  pre_aggregations: {
    main: {
      // ...
 
      indexes: {
        category_productname_zipcode_index: {
          columns: [
            product_category,
            zip_code,
            product_name
          ]
        }
      }
    }
  }
})

Here's why:

The product_category dimension comes first as it's used in a single-value filter.
Then, the zip_code dimension comes second as it's used in GROUP BY.
The product_name dimension comes last as it's used in a multiple-value filter.
The data within category_productname_zipcode_index would look as follows:

product_category	zip_code	product_name	timestamp	order_total
Electronics	88523	Mouse	2023-01-01 10:00:00	800
Electronics	88523	Plastic Chair	2023-01-01 10:00:00	2000
Furniture	88523	Keyboard	2023-01-01 10:00:00	1000
Electronics	88524	Keyboard	2023-01-01 11:00:00	2000
Furniture	88524	Plastic Chair	2023-01-01 11:00:00	3000
Aggregating indexes
Aggregating indexes should be used when there is a wide rollup pre-aggregation, however, only a subset of its dimensions is queried. For example, you have rollup pre-aggregation with 50 dimensions, but any query is just using only 5 of those dimensions. Such a use case would be a sweet spot for the aggregating index. Such indexes would persist only dimensions from the index definition and pre-aggregated measures from the pre-aggregation definition. Cube Store would aggregate over missing dimensions to calculate stored measure values when preparing the aggregating index. During querying time, Cube Store will save time on this aggregation over missing dimensions, as it was done during the preparation step.

Queries with the following characteristics can target aggregating indexes:

They cannot make use of any filters other than for dimensions that are included in that index.
All dimensions used in the query must be defined in the aggregating index.
Queries that do not have the characteristics above can still make use of regular indexes so that their performance can still be optimized.

In other words, an aggregating index is a rollup of data in a rollup table. Data needs to be downloaded from the upstream data source as many times as many pre-aggregations you have. Compared to having multiple pre-aggregations, having a single pre-aggregation with multiple aggregating indexes gives you pretty much the same performance from the Cube Store side but multiple times less cost from a data warehouse side.

Aggregating indexes are defined by using the type option in the index definition:

YAML
JavaScript
cube("orders", {
  // ...
 
  pre_aggregations: {
    main: {
      // ...
 
      indexes: {
        // ...
 
        zip_code_index: {
          columns: [zip_code],
          type: `aggregate`
        }
      }
    }
  }
})

The data for zip_code_index would look as follows:

zip_code	order_total
88523	3800
88524	5000
Compaction
Whenever a newer version of pre-aggregation is just built and becomes available its performance would be suboptimal as it's pending compaction. Most of the essential compaction process usually takes several seconds to several minutes for bigger partitions after pre-aggregation creation, depending on the size of the partition and the Cube Store workers' processing power available. This compaction process is usually unnoticeable for queries that are optimal in terms of index usage, so it's always best practice to make sure all of your queries match an index.

Inspecting pre-aggregations
Cube Store partially supports the MySQL protocol. This allows you to execute simple queries using a familiar SQL syntax. You can connect using the MySQL CLI client, for example:

mysql -h <CUBESTORE_IP> --user=cubestore -pcubestore --protocol=TCP

Only Linux and Mac OS versions of MySQL client are supported as of right now. You can install one on ubuntu using apt-get install default-mysql-client command or brew install mysql-client on Mac OS. Windows versions of the MySQL client aren't supported.

To check which pre-aggregations are managed by Cube Store, you could run the following query:

SELECT * FROM information_schema.tables;
+----------------------+-----------------------------------------------+
| table_schema         | table_name                                    |
+----------------------+-----------------------------------------------+
| dev_pre_aggregations | orders_main20190101_23jnqarg_uiyfxd0f_1gifflf |
| dev_pre_aggregations | orders_main20190301_24ph0a1c_utzntnv_1gifflf  |
| dev_pre_aggregations | orders_main20190201_zhrh5kj1_rkmsrffi_1gifflf |
| dev_pre_aggregations | orders_main20191001_mdw2hxku_waxajvwc_1gifflf |
| dev_pre_aggregations | orders_main20190701_izc2tl0h_bxsf1zlb_1gifflf |
+----------------------+-----------------------------------------------+
5 rows in set (0.01 sec)

These pre-aggregations are stored as Parquet files under the .cubestore/ folder in the project root during development.

EXPLAIN queries
Cube Store's MySQL protocol also supports EXPLAIN and EXPLAIN ANALYZE queries both of which are useful for determining how much processing a query will require.

EXPLAIN queries show the logical plan for a query:

 EXPLAIN SELECT orders__platform, orders__gender, sum(orders__count) FROM dev_pre_aggregations.orders_general_o32v4dvq_vbyemtl2_1h5hs8r
 GROUP BY orders__gender, orders__platform;
+-------------------------------------------------------------------------------------------------------------------------------------+
| logical plan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
+--------------------------------------------------------------------------------------------------------------------------------------+
| Projection, [dev_pre_aggregations.orders_general_o32v4dvq_vbyemtl2_1h5hs8r.orders__platform, dev_pre_aggregations.orders_general_o32v4dvq_vbyemtl2_1h5hs8r.orders__gender, SUM(dev_pre_aggregations.orders_general_o32v4dvq_vbyemtl2_1h5hs8r.orders__count)]
  Aggregate
    ClusterSend, indices: [[96]]
      Scan dev_pre_aggregations.orders_general_o32v4dvq_vbyemtl2_1h5hs8r, source: CubeTable(index: orders_general_plat_gender_o32v4dvq_vbyemtl2_1h5hs8r:96:[123, 126]), fields: [orders__gender, orders__platform, orders__count] |
+-------------------------------------------------------------------------------------------------------------------------------------+

EXPLAIN ANALYZE queries show the physical plan for the router and all workers used for query processing:

 EXPLAIN ANALYZE SELECT orders__platform, orders__gender, sum(orders__count) FROM dev_pre_aggregations.orders_general_o32v4dvq_vbyemtl2_1h5hs8r
 GROUP BY orders__gender, orders__platform
 
+-----------+-----------------+--------------------------------------------------------------------------------------------------------------------------+
| node type | node name       | physical plan                                                                                                                                                                                                                                                                                                                                                   |
+-----------+-----------------+--------------------------------------------------------------------------------------------------------------------------+
| router    |                 | Projection, [orders__platform, orders__gender, SUM(dev_pre_aggregations.orders_general_o32v4dvq_vbyemtl2_1h5hs8r.orders__count)@2:SUM(orders__count)]
  FinalInplaceAggregate
    ClusterSend, partitions: [[123, 126]]                                                                                                                                         |
| worker    | 127.0.0.1:10001 | PartialInplaceAggregate
  Merge
    Scan, index: orders_general_plat_gender_o32v4dvq_vbyemtl2_1h5hs8r:96:[123, 126], fields: [orders__gender, orders__platform, orders__count]
      Projection, [orders__gender, orders__platform, orders__count]
        ParquetScan, files: /.cubestore/data/126-0qtyakym.parquet |
+-----------+-----------------+--------------------------------------------------------------------------------------------------------------------------+

When you're debugging performance, one thing to keep in mind is that Cube Store, due to its design, will always use some index to query data, and usage of the index itself doesn't necessarily tell if the particular query is performing optimally or not. What's important to look at is aggregation and partition merge strategies. In most of the cases for aggregation, Cube Store will use HashAggregate or InplaceAggregate strategy as well as Merge and MergeSort operators to merge different partitions. Even for larger datasets, scan operations on sorted data will almost always be much more efficient and faster than hash aggregate as the Cube Store optimizer decides to use those only if there's an index with appropriate sorting. So, as a rule of thumb, if you see in your plan PartialHashAggregate and FinalHashAggregate nodes together with Merge operators, those queries most likely perform sub-optimally. On the other hand, if you see PartialInplaceAggregate, FinalInplaceAggregate, and FullInplaceAggregate together with MergeSort operators in your plan, then there's a high chance the query performs optimally. Sometimes, there can be exceptions to this rule. For example, a total count query run on top of the index will perform HashAggregate strategy on top of MergeSort nodes even if all required indexes are in place. This query would be optimal as well.

Pre-aggregations storage
Cube uses its own purpose-built pre-aggregations engine: Cube Store.

When using Cube Store, pre-aggregation data will be ingested and stored as Parquet files on a blob storage. Then, Cube Store would load that data to execute queries using pre-aggregations.

However, original_sql pre-aggregations are stored in the data source by default. It is not recommended to store original_sql pre-aggregations in Cube Store.

Joins between pre-aggregations
When making a query that joins data from two different cubes, Cube can use pre-aggregations instead of running the base SQL queries. To get started, first ensure both cubes have valid pre-aggregations:

YAML
JavaScript
cube(`orders`, {
  // ...
 
  pre_aggregations: {
    orders_rollup: {
      measures: [CUBE.count],
      dimensions: [CUBE.user_id, CUBE.status],
      time_dimension: CUBE.created_at,
      granularity: `day`
    }
  },
 
  joins: {
    users: {
      sql: `${CUBE.user_id} = ${users.id}`,
      relationship: `many_to_one`
    }
  }
})
 
cube(`users`, {
  // ...
 
  pre_aggregations: {
    users_rollup: {
      dimensions: [CUBE.id, CUBE.name]
    }
  }
})

Before we continue, let's add an index to the orders_rollup pre-aggregation so that the rollup_join pre-aggregation can work correctly:

YAML
JavaScript
cube(`orders`, {
  // ...
 
  pre_aggregations: {
    orders_rollup: {
      // ...
 
      indexes: {
        user_index: {
          columns: [CUBE.user_id]
        }
      }
    }
  }
})

Now we can add a new pre-aggregation of type rollup_join to the orders cube:

YAML
JavaScript
cube(`orders`, {
  // ...
 
  pre_aggregations: {
    // ...
 
    orders_with_users_rollup: {
      type: `rollup_join`,
      measures: [CUBE.count],
      dimensions: [users.name],
      time_dimension: CUBE.created_at,
      granularity: `day`,
      rollups: [users.users_rollup, CUBE.orders_rollup]
    }
  }
})

With all of the above set up, making a query such as the following will now use orders.orders_rollup and users.users_rollup, avoiding a database request:

{
  "dimensions": ["users.name"],
  "timeDimensions": [
    {
      "dimension": "orders.created_at",
      "dateRange": "This month"
    }
  ],
  "order": {
    "orders.count": "desc"
  },
  "measures": ["orders.count"]
}

Pre-Aggregation build strategies
For ideal performance, pre-aggregations should be built using a dedicated Refresh Worker. See here for more details.

Cube supports three different strategies for building pre-aggregations. To see which strategies your database supports, please refer to its individual page from Connecting to the Database.

Simple
When using the simple strategy, Cube will use the source database as a temporary staging area for writing pre-aggregations to determine column types. The data is loaded back into memory before writing them to Cube Store (or an external database).

For larger datasets, we strongly recommend using the Batching or Export Bucket strategies instead.

Internal vs External vs External with Cube Store diagram
Batching
Batching is a more performant strategy where Cube sends compressed CSVs for Cube Store to ingest.

Internal vs External vs External with Cube Store diagram
The performance scales to the amount of memory available on the Cube instance. Batching is automatically enabled for any databases that can support it.

Export bucket
The export bucket strategy requires permission to execute CREATE TABLE statements in the data source as part of the pre-aggregation build process.

Do not confuse the export bucket with the Cube Store storage bucket. Those are two separate storages and should never be mixed.

When dealing with larger pre-aggregations (more than 100k rows), performance can be significantly improved by using an export bucket. This allows the source database to temporarily materialize the data locally, which is then loaded into Cube Store in parallel:

Internal vs External vs External with Cube Store diagram
Enabling the export bucket functionality requires extra configuration and is not available for all data sources. Please refer to the database-specific documentation for more details. Data sources that support export buckets will have an "Export Bucket" section with more information.

When using cloud storage, it is important to correctly configure any data retention policies to clean up the data in the export bucket as Cube does not currently manage this. For most use-cases, 1 day is sufficient.

Streaming pre-aggregations
Streaming pre-aggregations are different from traditional pre-aggregations in the way they are being updated. Traditional pre-aggregations follow the “pull” model — Cube pulls updates from the data source based on some cadence and/or condition. Streaming pre-aggregations follow the “push” model — Cube subscribes to the updates from the data source and always keeps pre-aggregation up to date.

You don’t need to define refresh_key for streaming pre-aggregations. Whether pre-aggregation is streaming or not is defined by the data source.

Currently, Cube supports only one streaming data source - ksqlDB. All pre-aggregations where data source is ksqlDB are streaming.

We are working on supporting more data sources for streaming pre-aggregations, please let us know(opens in a new tab) if you are interested in early access to any of these drivers or would like Cube to support any other SQL streaming engine.

Troubleshooting
Unused pre-aggregations
You might find that a pre-aggregation is ignored by Cube. Possible reasons:

A pre-aggregation does not reference any dimensions or measures from a cube where this pre-aggreation is defined. To resolve, move it to another cube.
A pre-aggregation is defined similarly to another pre-aggregation that has more granular partitions. To resolve, remove one of these pre-aggregations.
Members with unknown types
When building pre-aggregations, you might get an error similar to the this one:

Error during create table: CREATE TABLE <REDACTED>:
Custom type 'fixed' is not supported

It means that a member of a pre-aggregation has a type in the upstream data source that Cube Store can not recognize (e.g., fixed in this case).

To resolve, please add a cast to a known type in the sql parameter of this member. For numeric types, it will most likely be an integer, a float, or a decimal type, depending on the nature of your data.

Was this page useful?

Documentation
Caching
Matching pre-aggregations
Matching queries with pre-aggregations
When executing a query, Cube will try to match and fulfill it with the best available pre-aggregation.

Since pre-aggregations contain a condensed representation of the data from the upstream data source (rather than a copy of that data), Cube needs to ensure that fulfilling a query with a pre-aggregation is possible and doing so will produce correct results.

If there's no matching pre-aggregation, Cube will fall back to querying the upstream data source, unless the rollup-only mode is enabled.

If you don't know why a query doesn't match a pre-aggregation, check common pitfalls first.

Eligible pre-aggregations
Cube goes through the following steps to determine if there are any pre-aggregations matching a query:

Members (e.g., dimensions, measures, etc.) are extracted from the query. If the query contains members of a view, they are substituted by respective members of cubes where they are defined. It means that pre-aggregations defined for cube members would also match queries with view members. There's no need to define additional pre-aggregations for views.
Cube looks for pre-aggregations in all cubes that define members in the query.
Pre-aggregations are tested in the order they are defined in the data model file. However, rollup pre-aggregations are tested before original_sql pre-aggregations.
The first pre-aggregation that matches a query is used.
Matching algorithm
Cube goes through the following steps to determine whether a query matches a particular eligible pre-aggregation:


See the details for each step:

Is query leaf-measure additive? Cube checks that all leaf measures in the query are additive. If the query contains calculated measures (e.g., measures defined as {sum} / {count}), then referenced leaf measures will be checked for additivity.
Does every member of the query exist in the pre-aggregation? Cube checks that the pre-aggregation contains all dimensions, filter dimensions, and leaf measures from the query.
Are any query measures multiplied in the cube's data model? Cube checks if any measures are multiplied via a one_to_many relationship between cubes in the query.
Does the query specify granularity for its time dimension? Cube checks that the time dimension granularity is set in the query.
Are query filter dimensions included in its own dimensions? Cube checks that all filter dimensions are also included as dimensions in the query.
Does every member in the query exist in the pre-aggregation? Cube checks that the pre-aggregation contains all dimensions and measures used in the query.
Matching time dimensions
There are extra considerations that apply to matching time dimensions.

Time dimension and granularity in the query together act as a dimension. If the date range isn't aligned with granularity, a common granularity is used. This common granularity is selected using the greatest common divisor(opens in a new tab) across both the query and pre-aggregation. For example, the common granularity between hour and day is hour because both hour and day can be divided by hour.
The query's granularity's date range must match the start date and end date from time dimensions. For example, when using a granularity of month, the values should be the start and end days of the month, i.e., ['2020-01-01T00:00:00.000', '2020-01-31T23:59:59.999']; when the granularity is day, the values should be the start and end hours of the day, i.e., ['2020-01-01T00:00:00.000', '2020-01-01T23:59:59.999']. Date ranges are inclusive, and the minimum granularity is second. By default, this is ensured via the allow_non_strict_date_range_match parameter of pre-aggregations: it allows to match non-strict date ranges and is set to true by default.
The time zone in the query must match the time zone of a pre-aggregation. You can configure a list of time zones that pre-aggregations will be built for using the scheduled_refresh_time_zones configuration option.
If a query specifies a custom granularity for its time dimension, then a matching pre-aggregation with the same custom granularity will be used even if there is also an matching pre-aggregation with a default granularity (e.g., day or month).

Matching ungrouped queries
There are extra considerations that apply to matching ungrouped queries:

The pre-aggregation should include primary keys of all cubes involved in the query.
If multiple cubes are referenced in the query, the pre-aggregation should include only members of these cubes.
Troubleshooting
If you're not sure why a query does not match a pre-aggregation, try to identify the part of the query that prevents it from matching. You can do that by removing measures, dimensions, filters, etc. from your query until it matches. Then, refer to the matching algorithm and common pitfalls to understand why that part was an issue.

Common pitfalls
Most commonly, a query would not match a pre-aggregation because they contain non-additive measures.

See this recipe for workarounds.

If a query uses any time zone other than UTC, please check the section on matching time dimensions and the scheduled_refresh_time_zones configuration option.


Documentation
Caching
Refreshing pre-aggregations
Refreshing pre-aggregations
Pre-aggregation refresh is the process of building pre-aggregations and updating them with new data. Pre-aggregation refresh is the responsibility of the refresh worker.

Configuration
You can use the following environment variables to configure the refresh worker behavior:

CUBEJS_REFRESH_WORKER (see also CUBEJS_PRE_AGGREGATIONS_BUILDER)
CUBEJS_PRE_AGGREGATIONS_SCHEMA
CUBEJS_SCHEDULED_REFRESH_TIMEZONES
CUBEJS_DB_QUERY_TIMEOUT
CUBEJS_REFRESH_WORKER_CONCURRENCY (see also CUBEJS_CONCURRENCY)
CUBEJS_SCHEDULED_REFRESH_QUERIES_PER_APP_ID
CUBEJS_DROP_PRE_AGG_WITHOUT_TOUCH
Troubleshooting
Refresh scheduler interval error
Sometimes, you might come across the following error:

{
  "message": "Refresh Scheduler Interval Error",
  "error": "Previous interval #2 was not finished with 60000 interval"
}

It indicates that your refresh worker is overloaded. You probably have a lot of tenants, a lot of pre-aggregations to refresh, or both.

If you're using multitenancy, you'd need to deploy several Cube clusters (each one per a reduced set of tenants) so there will be multiple refresh workers which will work only on a subset of your tenants.

If you're using Cube Cloud, you can use a production multi-cluster that would automatically do this for you.