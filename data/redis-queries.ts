export interface QueryCategory {
  category: string;
  icon: string;
  description: string;
  queries: QueryItem[];
}

export interface QueryItem {
  id: string;
  label: string;
  command: string; // Redis command string
  description: string;
  concept: string;
  apiPath: string;
}

export const redisQueryCategories: QueryCategory[] = [
  {
    category: "Strings",
    icon: "🔤",
    description: "The most basic Redis data type — key/value pairs",
    queries: [
      {
        id: "redis_set",
        label: "SET a Key",
        concept: "SET",
        description: "Store a string value — the most fundamental Redis operation",
        apiPath: "/api/redis/query",
        command: `SET candidate:1 "Alice Johnson"`,
      },
      {
        id: "redis_get",
        label: "GET a Key",
        concept: "GET",
        description: "Retrieve a string value by key",
        apiPath: "/api/redis/query",
        command: `GET candidate:1`,
      },
      {
        id: "redis_setex",
        label: "SET with Expiry (TTL)",
        concept: "SETEX",
        description: "Store a value that auto-deletes after N seconds — great for sessions/cache",
        apiPath: "/api/redis/query",
        command: `SETEX session:abc123 3600 "user:42"`,
      },
      {
        id: "redis_ttl",
        label: "Check TTL",
        concept: "TTL",
        description: "Check how many seconds remain before a key expires (-1 = no expiry, -2 = gone)",
        apiPath: "/api/redis/query",
        command: `TTL session:abc123`,
      },
      {
        id: "redis_mset",
        label: "SET Multiple Keys",
        concept: "MSET",
        description: "Set many keys atomically in one call — like a batch INSERT",
        apiPath: "/api/redis/query",
        command: `MSET candidate:2 "Bob Smith" candidate:3 "Carol Williams" candidate:4 "David Brown"`,
      },
      {
        id: "redis_mget",
        label: "GET Multiple Keys",
        concept: "MGET",
        description: "Retrieve multiple values in one round trip — reduces latency",
        apiPath: "/api/redis/query",
        command: `MGET candidate:1 candidate:2 candidate:3 candidate:4`,
      },
      {
        id: "redis_incr",
        label: "Atomic Counter",
        concept: "INCR",
        description: "Atomically increment a number — perfect for counters, rate limiting",
        apiPath: "/api/redis/query",
        command: `INCR page_views`,
      },
    ],
  },
  {
    category: "Hashes",
    icon: "🗂️",
    description: "Maps of field→value — like a row in a table",
    queries: [
      {
        id: "redis_hset",
        label: "HSET — Store Object",
        concept: "HSET",
        description: "Store a structured object — like INSERT INTO with multiple columns",
        apiPath: "/api/redis/query",
        command: `HSET candidate:profile:1 first_name Alice last_name Johnson status active department Engineering experience 5`,
      },
      {
        id: "redis_hgetall",
        label: "HGETALL — Read Object",
        concept: "HGETALL",
        description: "Get all fields of a hash — like SELECT * for a single row",
        apiPath: "/api/redis/query",
        command: `HGETALL candidate:profile:1`,
      },
      {
        id: "redis_hget",
        label: "HGET — Single Field",
        concept: "HGET",
        description: "Get one field from a hash — like SELECT specific_column WHERE id = x",
        apiPath: "/api/redis/query",
        command: `HGET candidate:profile:1 status`,
      },
      {
        id: "redis_hmget",
        label: "HMGET — Multiple Fields",
        concept: "HMGET",
        description: "Get several fields at once — like SELECT col1, col2 WHERE id = x",
        apiPath: "/api/redis/query",
        command: `HMGET candidate:profile:1 first_name last_name department experience`,
      },
      {
        id: "redis_hkeys",
        label: "HKEYS — List Fields",
        concept: "HKEYS",
        description: "List all field names in a hash — like DESCRIBE TABLE for one row",
        apiPath: "/api/redis/query",
        command: `HKEYS candidate:profile:1`,
      },
    ],
  },
  {
    category: "Lists",
    icon: "📋",
    description: "Ordered sequences — queues, stacks, activity feeds",
    queries: [
      {
        id: "redis_rpush",
        label: "RPUSH — Append to List",
        concept: "RPUSH",
        description: "Push values to the right (tail) of a list — like appending to a queue",
        apiPath: "/api/redis/query",
        command: `RPUSH interview:queue candidate:1 candidate:3 candidate:5 candidate:7`,
      },
      {
        id: "redis_lrange",
        label: "LRANGE — Read List",
        concept: "LRANGE",
        description: "Get a slice of a list — LRANGE key 0 -1 gets everything",
        apiPath: "/api/redis/query",
        command: `LRANGE interview:queue 0 -1`,
      },
      {
        id: "redis_llen",
        label: "LLEN — List Length",
        concept: "LLEN",
        description: "Count elements in a list — like SELECT COUNT(*) for a queue",
        apiPath: "/api/redis/query",
        command: `LLEN interview:queue`,
      },
      {
        id: "redis_lindex",
        label: "LINDEX — Get by Position",
        concept: "LINDEX",
        description: "Get element at a specific index — 0 = first, -1 = last",
        apiPath: "/api/redis/query",
        command: `LINDEX interview:queue 0`,
      },
    ],
  },
  {
    category: "Sets",
    icon: "🔵",
    description: "Unique unordered collections — tags, memberships, deduplication",
    queries: [
      {
        id: "redis_sadd",
        label: "SADD — Add Members",
        concept: "SADD",
        description: "Add unique members to a set — duplicates are silently ignored",
        apiPath: "/api/redis/query",
        command: `SADD skills:python candidate:1 candidate:3 candidate:7 candidate:10`,
      },
      {
        id: "redis_smembers",
        label: "SMEMBERS — All Members",
        concept: "SMEMBERS",
        description: "Get all members of a set — like SELECT * with guaranteed uniqueness",
        apiPath: "/api/redis/query",
        command: `SMEMBERS skills:python`,
      },
      {
        id: "redis_scard",
        label: "SCARD — Set Size",
        concept: "SCARD",
        description: "Count members in a set — like SELECT COUNT(DISTINCT ...)",
        apiPath: "/api/redis/query",
        command: `SCARD skills:python`,
      },
      {
        id: "redis_sismember",
        label: "SISMEMBER — Membership Check",
        concept: "SISMEMBER",
        description: "Check if a value is in a set — O(1) lookup, no table scan needed",
        apiPath: "/api/redis/query",
        command: `SISMEMBER skills:python candidate:1`,
      },
    ],
  },
  {
    category: "Sorted Sets",
    icon: "🏆",
    description: "Scored members — leaderboards, priority queues, rankings",
    queries: [
      {
        id: "redis_zadd",
        label: "ZADD — Add with Score",
        concept: "ZADD",
        description: "Add members with a numeric score — perfect for rankings and leaderboards",
        apiPath: "/api/redis/query",
        command: `ZADD candidate:scores 95 "Alice Johnson" 87 "Bob Smith" 92 "Carol Williams" 78 "David Brown" 98 "Eva Davis"`,
      },
      {
        id: "redis_zrange",
        label: "ZRANGE — Range by Rank",
        concept: "ZRANGE",
        description: "Get members ordered by score (lowest first) — like ORDER BY score ASC",
        apiPath: "/api/redis/query",
        command: `ZRANGE candidate:scores 0 -1 WITHSCORES`,
      },
      {
        id: "redis_zrank",
        label: "ZRANK — Get Rank",
        concept: "ZRANK",
        description: "Get the rank (position) of a member — 0-based, lowest score = rank 0",
        apiPath: "/api/redis/query",
        command: `ZRANK candidate:scores "Alice Johnson"`,
      },
      {
        id: "redis_zscore",
        label: "ZSCORE — Get Score",
        concept: "ZSCORE",
        description: "Get the score of a specific member",
        apiPath: "/api/redis/query",
        command: `ZSCORE candidate:scores "Eva Davis"`,
      },
      {
        id: "redis_zrangebyscore",
        label: "ZRANGEBYSCORE — Filter by Score",
        concept: "ZRANGEBYSCORE",
        description: "Get members within a score range — like WHERE score BETWEEN 85 AND 100",
        apiPath: "/api/redis/query",
        command: `ZRANGEBYSCORE candidate:scores 90 100 WITHSCORES`,
      },
    ],
  },
  {
    category: "Key Inspection",
    icon: "🔍",
    description: "Explore and manage keys — like schema inspection in SQL",
    queries: [
      {
        id: "redis_keys",
        label: "KEYS — Pattern Match",
        concept: "KEYS",
        description: "Find keys matching a pattern — like SHOW TABLES but with wildcards (* = any)",
        apiPath: "/api/redis/query",
        command: `KEYS candidate:*`,
      },
      {
        id: "redis_scan",
        label: "SCAN — Safe Iteration",
        concept: "SCAN",
        description: "Iterate keys without blocking — production-safe alternative to KEYS",
        apiPath: "/api/redis/query",
        command: `SCAN 0 MATCH * COUNT 20`,
      },
      {
        id: "redis_type",
        label: "TYPE — Key Data Type",
        concept: "TYPE",
        description: "Check what data type is stored at a key — string, hash, list, set, zset",
        apiPath: "/api/redis/query",
        command: `TYPE candidate:profile:1`,
      },
      {
        id: "redis_exists",
        label: "EXISTS — Key Check",
        concept: "EXISTS",
        description: "Check if a key exists — returns 1 (yes) or 0 (no)",
        apiPath: "/api/redis/query",
        command: `EXISTS candidate:1`,
      },
      {
        id: "redis_dbsize",
        label: "DBSIZE — Total Keys",
        concept: "DBSIZE",
        description: "Count all keys in the current database — like SELECT COUNT(*) on everything",
        apiPath: "/api/redis/query",
        command: `DBSIZE`,
      },
    ],
  },
];

export const allRedisQueries: QueryItem[] = redisQueryCategories.flatMap(
  (cat) => cat.queries
);
