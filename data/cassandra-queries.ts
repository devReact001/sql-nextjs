export interface QueryCategory {
  category: string;
  icon: string;
  description: string;
  queries: QueryItem[];
}

export interface QueryItem {
  id: string;
  label: string;
  cql: string;
  description: string;
  concept: string;
  apiPath: string; // which api route handles this
}

export const cassandraQueryCategories: QueryCategory[] = [
  {
    category: "Basic Reads",
    icon: "🔍",
    description: "Core Cassandra data retrieval with partition keys",
    queries: [
      {
        id: "cass_all_by_dept",
        label: "Candidates by Department",
        concept: "Partition Key Query",
        description:
          "Cassandra requires querying by partition key — no full table scans",
        apiPath: "/api/cassandra/query",
        cql: `SELECT * FROM candidates_by_department
WHERE department_id = :department_id;`,
      },
      {
        id: "cass_by_status",
        label: "Candidates by Status",
        concept: "Partition Key + Clustering",
        description:
          "Query using partition key with optional clustering column filter",
        apiPath: "/api/cassandra/query",
        cql: `SELECT * FROM candidates_by_status
WHERE status = :status;`,
      },
      {
        id: "cass_by_skill",
        label: "Candidates by Skill",
        concept: "Query by Partition",
        description:
          "In Cassandra, tables are designed around query patterns — one table per query",
        apiPath: "/api/cassandra/query",
        cql: `SELECT * FROM candidates_by_skill
WHERE skill = :skill;`,
      },
      {
        id: "cass_limit",
        label: "Limit Results",
        concept: "LIMIT",
        description:
          "LIMIT works similarly to SQL but is applied per partition",
        apiPath: "/api/cassandra/query",
        cql: `SELECT * FROM candidates_by_department
WHERE department_id = :department_id
LIMIT 5;`,
      },
    ],
  },
  {
    category: "Filtering",
    icon: "🎯",
    description: "CQL filtering — Cassandra is restrictive by design",
    queries: [
      {
        id: "cass_allow_filtering",
        label: "ALLOW FILTERING",
        concept: "ALLOW FILTERING",
        description:
          "Force Cassandra to filter non-primary-key columns — use carefully on small datasets",
        apiPath: "/api/cassandra/query",
        cql: `SELECT * FROM candidates_by_status
WHERE status = :status
  AND experience > 5
ALLOW FILTERING;`,
      },
      {
        id: "cass_in_clause",
        label: "IN Clause",
        concept: "IN on Partition Key",
        description:
          "Fetch multiple partitions in one query using IN on the partition key",
        apiPath: "/api/cassandra/query",
        cql: `SELECT * FROM candidates_by_status
WHERE status IN ('Active', 'Pending');`,
      },
      {
        id: "cass_token",
        label: "Token Range Scan",
        concept: "TOKEN()",
        description:
          "Use TOKEN() to paginate across partitions — Cassandra's way of doing full scans",
        apiPath: "/api/cassandra/query",
        cql: `SELECT token(department_id), department_id, candidate_id, name
FROM candidates_by_department
LIMIT 20;`,
      },
    ],
  },
  {
    category: "Aggregations",
    icon: "🧮",
    description: "CQL aggregate functions (limited vs SQL)",
    queries: [
      {
        id: "cass_count",
        label: "COUNT per Partition",
        concept: "COUNT(*)",
        description:
          "COUNT works per partition — Cassandra doesn't support cross-partition GROUP BY",
        apiPath: "/api/cassandra/query",
        cql: `SELECT COUNT(*) AS total
FROM candidates_by_status
WHERE status = 'Active';`,
      },
      {
        id: "cass_count_pending",
        label: "COUNT Pending",
        concept: "COUNT(*) filter",
        description: "Count candidates in a specific status bucket",
        apiPath: "/api/cassandra/query",
        cql: `SELECT COUNT(*) AS pending_count
FROM candidates_by_status
WHERE status = 'Pending';`,
      },
    ],
  },
  {
    category: "Schema & Metadata",
    icon: "📋",
    description: "Inspect Cassandra schema and system tables",
    queries: [
      {
        id: "cass_tables",
        label: "List Tables",
        concept: "system_schema.tables",
        description:
          "Query Cassandra's system schema to list all tables in the keyspace",
        apiPath: "/api/cassandra/schema",
        cql: `SELECT table_name, comment
FROM system_schema.tables
WHERE keyspace_name = 'candidate_system';`,
      },
      {
        id: "cass_columns",
        label: "Table Columns",
        concept: "system_schema.columns",
        description:
          "Inspect column definitions — kind shows if it's a partition key, clustering, or regular column",
        apiPath: "/api/cassandra/schema",
        cql: `SELECT column_name, type, kind
FROM system_schema.columns
WHERE keyspace_name = 'candidate_system'
  AND table_name = 'candidates_by_department';`,
      },
      {
        id: "cass_keyspaces",
        label: "List Keyspaces",
        concept: "system_schema.keyspaces",
        description:
          "List all keyspaces — equivalent to databases in PostgreSQL/MySQL",
        apiPath: "/api/cassandra/schema",
        cql: `SELECT keyspace_name, durable_writes, replication
FROM system_schema.keyspaces;`,
      },
      {
        id: "cass_indexes",
        label: "List Indexes",
        concept: "system_schema.indexes",
        description:
          "Show secondary indexes — unlike SQL, Cassandra indexes are limited and expensive",
        apiPath: "/api/cassandra/schema",
        cql: `SELECT index_name, table_name, kind, options
FROM system_schema.indexes
WHERE keyspace_name = 'candidate_system';`,
      },
    ],
  },
  {
    category: "Cassandra Concepts",
    icon: "⚡",
    description: "Unique Cassandra architecture features",
    queries: [
      {
        id: "cass_writetime",
        label: "WRITETIME",
        concept: "WRITETIME()",
        description:
          "Cassandra stores a timestamp for every write — WRITETIME() retrieves it in microseconds",
        apiPath: "/api/cassandra/query",
        cql: `SELECT name, email,
  WRITETIME(name) AS write_timestamp
FROM candidates_by_department
WHERE department_id = :department_id
LIMIT 10;`,
      },
      {
        id: "cass_ttl",
        label: "TTL Check",
        concept: "TTL()",
        description:
          "Cassandra supports time-to-live on columns — TTL() shows seconds until expiry (null = no expiry)",
        apiPath: "/api/cassandra/query",
        cql: `SELECT name, email,
  TTL(name) AS ttl_seconds
FROM candidates_by_department
WHERE department_id = :department_id
LIMIT 10;`,
      },
      {
        id: "cass_system_local",
        label: "Node Info",
        concept: "system.local",
        description:
          "Query the local system table — shows the Cassandra node and cluster information",
        apiPath: "/api/cassandra/schema",
        cql: `SELECT cluster_name, data_center, rack,
  release_version, partitioner
FROM system.local;`,
      },
      {
        id: "cass_system_peers",
        label: "Cluster Peers",
        concept: "system.peers",
        description:
          "Show other nodes in the Cassandra cluster — useful for understanding replication",
        apiPath: "/api/cassandra/schema",
        cql: `SELECT peer, data_center, rack, release_version
FROM system.peers;`,
      },
    ],
  },
  {
    category: "Data Modeling",
    icon: "🏗️",
    description: "Cassandra query-first data modeling patterns",
    queries: [
      {
        id: "cass_all_departments",
        label: "All Department IDs",
        concept: "Partition Discovery",
        description:
          "Use DISTINCT to find all partition keys — Cassandra's approach to listing unique groups",
        apiPath: "/api/cassandra/query",
        cql: `SELECT DISTINCT department_id
FROM candidates_by_department;`,
      },
      {
        id: "cass_all_statuses",
        label: "All Status Partitions",
        concept: "DISTINCT partition keys",
        description:
          "List all unique partition keys in the candidates_by_status table",
        apiPath: "/api/cassandra/query",
        cql: `SELECT DISTINCT status
FROM candidates_by_status;`,
      },
    ],
  },
];

export const allCassandraQueries = cassandraQueryCategories.flatMap((cat) =>
  cat.queries.map((q) => ({ ...q, category: cat.category, icon: cat.icon })),
);