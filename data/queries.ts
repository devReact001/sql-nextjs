export interface QueryCategory {
  category: string;
  icon: string;
  description: string;
  queries: QueryItem[];
}

export interface QueryItem {
  id: string;
  label: string;
  sql: string;
  description: string;
  concept: string;
}

export const queryCategories: QueryCategory[] = [
  {
    category: "Basic SELECT",
    icon: "🔍",
    description: "Fundamental data retrieval",
    queries: [
      {
        id: "select_all",
        label: "All Candidates",
        concept: "SELECT *",
        description: "Retrieve all rows and columns from the candidates table",
        sql: `SELECT * FROM candidates ORDER BY id LIMIT 50;`,
      },
      {
        id: "select_columns",
        label: "Specific Columns",
        concept: "Column Selection",
        description: "Select only specific columns to reduce data transfer",
        sql: `SELECT id, first_name, last_name, email, status
FROM candidates
ORDER BY first_name;`,
      },
      {
        id: "select_distinct",
        label: "Distinct Values",
        concept: "DISTINCT",
        description: "Get unique values — removes duplicate rows",
        sql: `SELECT DISTINCT status
FROM candidates
ORDER BY status;`,
      },
      {
        id: "select_alias",
        label: "Column Aliases",
        concept: "AS Alias",
        description: "Rename columns in the result set using aliases",
        sql: `SELECT
  id,
  first_name AS "First Name",
  last_name  AS "Last Name",
  email      AS "Email Address",
  status     AS "Current Status"
FROM candidates
ORDER BY id
LIMIT 20;`,
      },
    ],
  },
  {
    category: "Filtering (WHERE)",
    icon: "🎯",
    description: "Filter rows with conditions",
    queries: [
      {
        id: "where_basic",
        label: "Filter by Status",
        concept: "WHERE =",
        description: "Filter rows matching an exact value",
        sql: `SELECT id, first_name, last_name, email, status
FROM candidates
WHERE status = 'Active'
ORDER BY first_name;`,
      },
      {
        id: "where_like",
        label: "Pattern Matching",
        concept: "LIKE / ILIKE",
        description: "Search for patterns using wildcards. ILIKE is case-insensitive",
        sql: `SELECT id, first_name, last_name, email
FROM candidates
WHERE first_name ILIKE 'j%'
ORDER BY first_name;`,
      },
      {
        id: "where_in",
        label: "IN Operator",
        concept: "IN (...)",
        description: "Match any value in a list — cleaner than multiple OR conditions",
        sql: `SELECT id, first_name, last_name, status, skills
FROM candidates
WHERE status IN ('Active', 'Pending')
ORDER BY status, first_name;`,
      },
      {
        id: "where_between",
        label: "Range Filter",
        concept: "BETWEEN",
        description: "Filter rows within an inclusive range",
        sql: `SELECT id, first_name, last_name, experience, status
FROM candidates
WHERE experience BETWEEN 3 AND 8
ORDER BY experience DESC;`,
      },
      {
        id: "where_null",
        label: "NULL Checks",
        concept: "IS NULL / IS NOT NULL",
        description: "Check for missing values — never use = NULL, always IS NULL",
        sql: `SELECT id, first_name, last_name, phone, email
FROM candidates
WHERE phone IS NOT NULL
ORDER BY first_name;`,
      },
      {
        id: "where_and_or",
        label: "AND / OR Logic",
        concept: "Compound Conditions",
        description: "Combine multiple conditions with AND / OR",
        sql: `SELECT id, first_name, last_name, experience, status
FROM candidates
WHERE (status = 'Active' OR status = 'Pending')
  AND experience >= 5
ORDER BY experience DESC;`,
      },
    ],
  },
  {
    category: "Sorting & Limiting",
    icon: "📊",
    description: "Control result order and size",
    queries: [
      {
        id: "order_by",
        label: "Multi-column Sort",
        concept: "ORDER BY",
        description: "Sort by multiple columns — useful for tie-breaking",
        sql: `SELECT id, first_name, last_name, experience, status
FROM candidates
ORDER BY experience DESC, first_name ASC
LIMIT 15;`,
      },
      {
        id: "limit_offset",
        label: "Pagination",
        concept: "LIMIT / OFFSET",
        description: "Implement pagination — get page 2 of 5 rows per page",
        sql: `SELECT id, first_name, last_name, email
FROM candidates
ORDER BY id
LIMIT 5 OFFSET 5;`,
      },
      {
        id: "top_n",
        label: "Top N Records",
        concept: "TOP N Pattern",
        description: "Get the top N candidates by experience",
        sql: `SELECT id, first_name, last_name, experience, skills
FROM candidates
ORDER BY experience DESC
LIMIT 10;`,
      },
    ],
  },
  {
    category: "Aggregations",
    icon: "🧮",
    description: "GROUP BY, COUNT, SUM, AVG",
    queries: [
      {
        id: "count",
        label: "Count Records",
        concept: "COUNT(*)",
        description: "Count total rows in the table",
        sql: `SELECT COUNT(*) AS total_candidates
FROM candidates;`,
      },
      {
        id: "group_by_status",
        label: "Group by Status",
        concept: "GROUP BY + COUNT",
        description: "Count candidates grouped by their status",
        sql: `SELECT
  status,
  COUNT(*) AS total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM candidates
GROUP BY status
ORDER BY total DESC;`,
      },
      {
        id: "avg_experience",
        label: "Average Experience",
        concept: "AVG / MIN / MAX",
        description: "Aggregate numeric fields to get statistics",
        sql: `SELECT
  status,
  ROUND(AVG(experience), 2) AS avg_experience,
  MIN(experience)           AS min_experience,
  MAX(experience)           AS max_experience,
  COUNT(*)                  AS count
FROM candidates
GROUP BY status
ORDER BY avg_experience DESC;`,
      },
      {
        id: "having",
        label: "HAVING Clause",
        concept: "HAVING",
        description: "Filter groups — like WHERE but applied after GROUP BY",
        sql: `SELECT
  skills,
  COUNT(*) AS candidate_count,
  ROUND(AVG(experience), 1) AS avg_exp
FROM candidates
WHERE skills IS NOT NULL
GROUP BY skills
HAVING COUNT(*) >= 1
ORDER BY candidate_count DESC
LIMIT 20;`,
      },
    ],
  },
  {
    category: "Window Functions",
    icon: "🪟",
    description: "Advanced analytics without collapsing rows",
    queries: [
      {
        id: "row_number",
        label: "Row Number",
        concept: "ROW_NUMBER()",
        description: "Assign a unique sequential number per partition",
        sql: `SELECT
  id,
  first_name,
  last_name,
  experience,
  status,
  ROW_NUMBER() OVER (PARTITION BY status ORDER BY experience DESC) AS rank_in_status
FROM candidates
ORDER BY status, rank_in_status;`,
      },
      {
        id: "rank",
        label: "RANK & DENSE_RANK",
        concept: "RANK / DENSE_RANK",
        description: "RANK skips numbers on ties; DENSE_RANK does not",
        sql: `SELECT
  first_name,
  last_name,
  experience,
  RANK()       OVER (ORDER BY experience DESC) AS rank,
  DENSE_RANK() OVER (ORDER BY experience DESC) AS dense_rank
FROM candidates
ORDER BY experience DESC
LIMIT 20;`,
      },
      {
        id: "running_total",
        label: "Running Total",
        concept: "SUM() OVER ()",
        description: "Cumulative sum — classic window function use case",
        sql: `SELECT
  id,
  first_name,
  last_name,
  experience,
  SUM(experience) OVER (ORDER BY id) AS running_total_exp,
  AVG(experience) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS rolling_avg_3
FROM candidates
ORDER BY id
LIMIT 20;`,
      },
      {
        id: "lag_lead",
        label: "LAG & LEAD",
        concept: "LAG / LEAD",
        description: "Access previous or next row values without self-joins",
        sql: `SELECT
  id,
  first_name,
  experience,
  LAG(experience)  OVER (ORDER BY id) AS prev_experience,
  LEAD(experience) OVER (ORDER BY id) AS next_experience,
  experience - LAG(experience) OVER (ORDER BY id) AS diff_from_prev
FROM candidates
ORDER BY id
LIMIT 20;`,
      },
      {
        id: "ntile",
        label: "NTILE Quartiles",
        concept: "NTILE(n)",
        description: "Divide rows into N equal buckets — useful for percentile analysis",
        sql: `SELECT
  first_name,
  last_name,
  experience,
  NTILE(4) OVER (ORDER BY experience) AS quartile,
  CASE NTILE(4) OVER (ORDER BY experience)
    WHEN 1 THEN 'Bottom 25%'
    WHEN 2 THEN 'Lower Mid 25%'
    WHEN 3 THEN 'Upper Mid 25%'
    WHEN 4 THEN 'Top 25%'
  END AS quartile_label
FROM candidates
ORDER BY experience DESC;`,
      },
    ],
  },
  {
    category: "Subqueries & CTEs",
    icon: "🔄",
    description: "Nested queries and WITH clauses",
    queries: [
      {
        id: "subquery_where",
        label: "Subquery in WHERE",
        concept: "Scalar Subquery",
        description: "Use a subquery result as a filter value",
        sql: `SELECT id, first_name, last_name, experience
FROM candidates
WHERE experience > (
  SELECT AVG(experience) FROM candidates
)
ORDER BY experience DESC;`,
      },
      {
        id: "subquery_from",
        label: "Derived Table",
        concept: "Subquery in FROM",
        description: "Use a subquery as a derived table in the FROM clause",
        sql: `SELECT
  status,
  avg_exp,
  CASE
    WHEN avg_exp >= 7 THEN 'Senior Pool'
    WHEN avg_exp >= 4 THEN 'Mid Pool'
    ELSE 'Junior Pool'
  END AS pool_level
FROM (
  SELECT status, ROUND(AVG(experience), 2) AS avg_exp
  FROM candidates
  GROUP BY status
) AS status_stats
ORDER BY avg_exp DESC;`,
      },
      {
        id: "cte_basic",
        label: "CTE (WITH clause)",
        concept: "Common Table Expression",
        description: "CTEs make complex queries readable by naming intermediate results",
        sql: `WITH experienced_candidates AS (
  SELECT *
  FROM candidates
  WHERE experience >= 7
),
active_experienced AS (
  SELECT *
  FROM experienced_candidates
  WHERE status = 'Active'
)
SELECT
  id,
  first_name,
  last_name,
  experience,
  skills
FROM active_experienced
ORDER BY experience DESC;`,
      },
      {
        id: "exists",
        label: "EXISTS Operator",
        concept: "EXISTS / NOT EXISTS",
        description: "Check for existence of related rows — often faster than IN for large sets",
        sql: `SELECT id, first_name, last_name, phone
FROM candidates c
WHERE EXISTS (
  SELECT 1
  FROM candidates c2
  WHERE c2.first_name = c.first_name
    AND c2.id <> c.id
)
ORDER BY first_name;`,
      },
    ],
  },
  {
    category: "String Functions",
    icon: "🔤",
    description: "Text manipulation and formatting",
    queries: [
      {
        id: "string_concat",
        label: "Concatenation",
        concept: "CONCAT / ||",
        description: "Combine string columns together",
        sql: `SELECT
  id,
  first_name || ' ' || last_name   AS full_name,
  UPPER(first_name)                AS first_upper,
  LOWER(last_name)                 AS last_lower,
  LENGTH(email)                    AS email_length,
  SPLIT_PART(email, '@', 2)        AS email_domain
FROM candidates
ORDER BY full_name
LIMIT 20;`,
      },
      {
        id: "string_extract",
        label: "Substring & Position",
        concept: "SUBSTRING / POSITION",
        description: "Extract parts of strings",
        sql: `SELECT
  first_name,
  last_name,
  email,
  SUBSTRING(email FROM 1 FOR POSITION('@' IN email) - 1) AS username,
  SUBSTRING(email FROM POSITION('@' IN email) + 1)        AS domain,
  LEFT(phone, 3)                                          AS area_code
FROM candidates
WHERE phone IS NOT NULL
ORDER BY first_name
LIMIT 20;`,
      },
      {
        id: "string_trim",
        label: "TRIM & REPLACE",
        concept: "TRIM / REPLACE / REGEXP",
        description: "Clean and transform string data",
        sql: `SELECT
  first_name,
  last_name,
  skills,
  TRIM(skills)                            AS trimmed_skills,
  REPLACE(email, '.com', '.org')          AS replaced_email,
  REGEXP_REPLACE(phone, '[^0-9]', '', 'g') AS digits_only
FROM candidates
WHERE phone IS NOT NULL
LIMIT 20;`,
      },
    ],
  },
  {
    category: "Date & Time",
    icon: "📅",
    description: "Temporal data operations",
    queries: [
      {
        id: "date_extract",
        label: "Date Parts",
        concept: "EXTRACT / DATE_PART",
        description: "Extract year, month, day from timestamps",
        sql: `SELECT
  id,
  first_name,
  created_at,
  EXTRACT(YEAR  FROM created_at) AS year,
  EXTRACT(MONTH FROM created_at) AS month,
  EXTRACT(DAY   FROM created_at) AS day,
  TO_CHAR(created_at, 'Month DD, YYYY') AS formatted_date
FROM candidates
ORDER BY created_at DESC
LIMIT 20;`,
      },
      {
        id: "date_diff",
        label: "Date Arithmetic",
        concept: "AGE / INTERVAL",
        description: "Calculate differences between dates",
        sql: `SELECT
  id,
  first_name,
  last_name,
  created_at,
  NOW() - created_at                                  AS time_since_created,
  EXTRACT(DAY FROM NOW() - created_at)::INT           AS days_since_created,
  DATE_TRUNC('month', created_at)                     AS created_month
FROM candidates
ORDER BY created_at DESC
LIMIT 20;`,
      },
      {
        id: "date_group",
        label: "Group by Month",
        concept: "DATE_TRUNC + GROUP BY",
        description: "Aggregate data by time periods",
        sql: `SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*)                         AS new_candidates,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) AS running_total
FROM candidates
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;`,
      },
    ],
  },
  {
    category: "CASE & Conditional",
    icon: "🔀",
    description: "Conditional logic in SQL",
    queries: [
      {
        id: "case_simple",
        label: "CASE Expression",
        concept: "CASE WHEN",
        description: "Add conditional columns — equivalent to if/else",
        sql: `SELECT
  id,
  first_name,
  last_name,
  experience,
  CASE
    WHEN experience >= 8 THEN 'Senior'
    WHEN experience >= 5 THEN 'Mid-level'
    WHEN experience >= 2 THEN 'Junior'
    ELSE 'Entry level'
  END AS seniority_level,
  status
FROM candidates
ORDER BY experience DESC;`,
      },
      {
        id: "coalesce",
        label: "COALESCE & NULLIF",
        concept: "COALESCE / NULLIF",
        description: "Handle NULLs gracefully — return fallback values",
        sql: `SELECT
  id,
  first_name,
  last_name,
  COALESCE(phone, 'No phone on file')  AS phone_display,
  COALESCE(skills, 'Not specified')    AS skills_display,
  NULLIF(status, 'Inactive')           AS active_status
FROM candidates
ORDER BY first_name
LIMIT 20;`,
      },
    ],
  },
  {
    category: "Advanced Patterns",
    icon: "⚡",
    description: "Complex real-world query patterns",
    queries: [
      {
        id: "pivot",
        label: "Pivot / Cross-tab",
        concept: "Conditional Aggregation",
        description: "Pivot rows to columns using CASE inside aggregates",
        sql: `SELECT
  skills,
  COUNT(*)                                              AS total,
  COUNT(*) FILTER (WHERE status = 'Active')             AS active,
  COUNT(*) FILTER (WHERE status = 'Inactive')           AS inactive,
  ROUND(AVG(experience), 1)                             AS avg_exp
FROM candidates
WHERE skills IS NOT NULL
GROUP BY skills
ORDER BY total DESC
LIMIT 15;`,
      },
      {
        id: "percentile",
        label: "Percentile Stats",
        concept: "PERCENTILE_CONT",
        description: "Calculate median and percentiles — ordered-set aggregate functions",
        sql: `SELECT
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY experience) AS p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY experience) AS median,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY experience) AS p75,
  PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY experience) AS p90,
  AVG(experience)                                          AS mean,
  STDDEV(experience)                                       AS std_dev
FROM candidates;`,
      },
      {
        id: "duplicate_detection",
        label: "Find Duplicates",
        concept: "Duplicate Detection",
        description: "Real-world pattern: find duplicate records by multiple fields",
        sql: `WITH duplicate_emails AS (
  SELECT
    email,
    COUNT(*) AS occurrences
  FROM candidates
  GROUP BY email
  HAVING COUNT(*) > 1
)
SELECT
  c.id,
  c.first_name,
  c.last_name,
  c.email,
  d.occurrences
FROM candidates c
INNER JOIN duplicate_emails d ON c.email = d.email
ORDER BY c.email, c.id;`,
      },
      {
        id: "top_per_group",
        label: "Top N per Group",
        concept: "ROW_NUMBER Pattern",
        description: "Get the top 2 most experienced candidates per status — classic interview problem",
        sql: `WITH ranked AS (
  SELECT
    id,
    first_name,
    last_name,
    experience,
    status,
    ROW_NUMBER() OVER (PARTITION BY status ORDER BY experience DESC) AS rn
  FROM candidates
)
SELECT id, first_name, last_name, experience, status, rn
FROM ranked
WHERE rn <= 2
ORDER BY status, rn;`,
      },
      {
        id: "search_fulltext",
        label: "Full-text Search",
        concept: "ILIKE Pattern Search",
        description: "Search across multiple columns simultaneously",
        sql: `SELECT
  id,
  first_name,
  last_name,
  email,
  skills,
  status
FROM candidates
WHERE
  first_name ILIKE '%a%'
  OR last_name ILIKE '%a%'
  OR email ILIKE '%a%'
  OR skills ILIKE '%python%'
ORDER BY first_name
LIMIT 20;`,
      },
    ],
  },
];

export const allQueries = queryCategories.flatMap(cat =>
  cat.queries.map(q => ({ ...q, category: cat.category, icon: cat.icon }))
);
