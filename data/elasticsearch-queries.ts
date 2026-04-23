export interface QueryCategory {
  category: string;
  icon: string;
  description: string;
  queries: QueryItem[];
}

export interface QueryItem {
  id: string;
  label: string;
  esQuery: string; // JSON body for Elasticsearch
  description: string;
  concept: string;
  apiPath: string;
  index: string; // which index to query
}

export const elasticsearchQueryCategories: QueryCategory[] = [
  {
    category: "Basic Search",
    icon: "🔍",
    description: "Fundamental Elasticsearch search operations",
    queries: [
      {
        id: "es_match_all",
        label: "Match All Documents",
        concept: "match_all",
        description: "Retrieve all documents from the index — equivalent to SELECT *",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: { match_all: {} },
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_match_field",
        label: "Match by Field",
        concept: "match",
        description: "Full-text search on a specific field — tokenized and analyzed",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              match: {
                status: "active",
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_multi_match",
        label: "Multi-Field Search",
        concept: "multi_match",
        description: "Search across multiple fields simultaneously — like LIKE across columns",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              multi_match: {
                query: "engineering",
                fields: ["skills", "department", "notes"],
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_select_fields",
        label: "Select Specific Fields",
        concept: "_source filtering",
        description: "Return only specified fields — like SELECT col1, col2 in SQL",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: { match_all: {} },
            _source: ["first_name", "last_name", "email", "status"],
            size: 20,
          },
          null,
          2
        ),
      },
    ],
  },
  {
    category: "Filtering",
    icon: "🎯",
    description: "Exact filters using term, range, and bool queries",
    queries: [
      {
        id: "es_term",
        label: "Exact Term Filter",
        concept: "term",
        description: "Exact keyword match — like WHERE status = 'active' (no analysis)",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              term: {
                "status.keyword": "active",
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_terms",
        label: "Multiple Values (IN)",
        concept: "terms",
        description: "Match any of multiple values — equivalent to WHERE status IN (...)",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              terms: {
                "status.keyword": ["active", "interviewing"],
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_range",
        label: "Range Filter",
        concept: "range",
        description: "Filter by numeric or date ranges — like WHERE experience BETWEEN 3 AND 8",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              range: {
                experience: {
                  gte: 3,
                  lte: 8,
                },
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_exists",
        label: "Field Exists",
        concept: "exists",
        description: "Filter documents where a field has a non-null value — like WHERE col IS NOT NULL",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              exists: {
                field: "email",
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
    ],
  },
  {
    category: "Bool Queries",
    icon: "🧩",
    description: "Combine conditions with must, should, must_not, filter",
    queries: [
      {
        id: "es_bool_must",
        label: "AND Conditions (must)",
        concept: "bool.must",
        description: "All conditions must match — equivalent to WHERE a AND b",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              bool: {
                must: [
                  { term: { "status.keyword": "active" } },
                  { range: { experience: { gte: 3 } } },
                ],
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_bool_should",
        label: "OR Conditions (should)",
        concept: "bool.should",
        description: "At least one condition must match — equivalent to WHERE a OR b",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              bool: {
                should: [
                  { term: { "status.keyword": "active" } },
                  { term: { "status.keyword": "interviewing" } },
                ],
                minimum_should_match: 1,
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_bool_must_not",
        label: "NOT Condition (must_not)",
        concept: "bool.must_not",
        description: "Exclude matching documents — equivalent to WHERE NOT or != in SQL",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              bool: {
                must_not: [{ term: { "status.keyword": "rejected" } }],
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_bool_filter",
        label: "Filter (no scoring)",
        concept: "bool.filter",
        description: "Like must but skips relevance scoring — faster for exact filters",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              bool: {
                filter: [
                  { term: { "status.keyword": "active" } },
                  { range: { experience: { gte: 5 } } },
                ],
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
    ],
  },
  {
    category: "Aggregations",
    icon: "📊",
    description: "Group and aggregate data — like GROUP BY in SQL",
    queries: [
      {
        id: "es_agg_terms",
        label: "Group By Field",
        concept: "terms agg",
        description: "Count documents per unique value — like SELECT status, COUNT(*) GROUP BY status",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            size: 0,
            aggs: {
              by_status: {
                terms: {
                  field: "status.keyword",
                  size: 20,
                },
              },
            },
          },
          null,
          2
        ),
      },
      {
        id: "es_agg_avg",
        label: "Average Value",
        concept: "avg agg",
        description: "Compute the average of a numeric field — like SELECT AVG(experience)",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            size: 0,
            aggs: {
              avg_experience: {
                avg: { field: "experience" },
              },
            },
          },
          null,
          2
        ),
      },
      {
        id: "es_agg_stats",
        label: "Stats (min/max/avg/sum)",
        concept: "stats agg",
        description: "Get all basic statistics in one query — like multiple SQL aggregate functions",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            size: 0,
            aggs: {
              experience_stats: {
                stats: { field: "experience" },
              },
            },
          },
          null,
          2
        ),
      },
      {
        id: "es_agg_nested",
        label: "Nested Aggregation",
        concept: "nested agg",
        description: "Group by status, then compute average experience per group — like GROUP BY with sub-aggregates",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            size: 0,
            aggs: {
              by_status: {
                terms: { field: "status.keyword", size: 10 },
                aggs: {
                  avg_exp: {
                    avg: { field: "experience" },
                  },
                },
              },
            },
          },
          null,
          2
        ),
      },
    ],
  },
  {
    category: "Full-Text Search",
    icon: "💬",
    description: "Advanced text search — Elasticsearch's core strength",
    queries: [
      {
        id: "es_match_phrase",
        label: "Exact Phrase Match",
        concept: "match_phrase",
        description: "Match an exact phrase in order — more precise than match",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              match_phrase: {
                notes: "machine learning",
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_wildcard",
        label: "Wildcard Search",
        concept: "wildcard",
        description: "Pattern matching with * and ? — like LIKE '%eng%' in SQL",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              wildcard: {
                "email.keyword": {
                  value: "*@gmail.com",
                },
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_fuzzy",
        label: "Fuzzy Search",
        concept: "fuzzy",
        description: "Tolerates typos and misspellings — unique to search engines, no SQL equivalent",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: {
              fuzzy: {
                first_name: {
                  value: "jon",
                  fuzziness: "AUTO",
                },
              },
            },
            size: 20,
          },
          null,
          2
        ),
      },
    ],
  },
  {
    category: "Sorting & Pagination",
    icon: "📄",
    description: "Sort results and paginate — like ORDER BY and LIMIT/OFFSET",
    queries: [
      {
        id: "es_sort",
        label: "Sort Results",
        concept: "sort",
        description: "Order results by a field — like ORDER BY experience DESC",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: { match_all: {} },
            sort: [{ experience: { order: "desc" } }],
            size: 20,
          },
          null,
          2
        ),
      },
      {
        id: "es_pagination",
        label: "Pagination (from/size)",
        concept: "from + size",
        description: "Skip N docs and return M — like LIMIT 10 OFFSET 20 in SQL",
        apiPath: "/api/elasticsearch/query",
        index: "candidates",
        esQuery: JSON.stringify(
          {
            query: { match_all: {} },
            from: 20,
            size: 10,
          },
          null,
          2
        ),
      },
    ],
  },
];

export const allElasticsearchQueries: QueryItem[] = elasticsearchQueryCategories.flatMap(
  (cat) => cat.queries
);
