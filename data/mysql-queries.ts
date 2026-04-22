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

export const mysqlQueryCategories: QueryCategory[] = [
  {
    category: "Basic SELECT",
    icon: "🔍",
    description: "Core MySQL data retrieval",
    queries: [
      {
        id: "mysql_select_all",
        label: "All Candidates",
        concept: "SELECT *",
        description: "Retrieve all rows from the candidates table",
        sql: `SELECT * FROM candidates ORDER BY id LIMIT 50;`,
      },
      {
        id: "mysql_show_tables",
        label: "Show Tables",
        concept: "SHOW TABLES",
        description: "MySQL-specific: list all tables in the database",
        sql: `SHOW TABLES;`,
      },
      {
        id: "mysql_describe",
        label: "Describe Table",
        concept: "DESCRIBE",
        description: "MySQL-specific: show column definitions and types",
        sql: `DESCRIBE candidates;`,
      },
      {
        id: "mysql_show_create",
        label: "Show Index Info",
        concept: "SHOW INDEX",
        description: "Show index information for a table",
        sql: `SHOW INDEX FROM candidates;`,
      },
    ],
  },
  {
    category: "JOINs",
    icon: "🔗",
    description: "Combining tables with JOINs",
    queries: [
      {
        id: "mysql_inner_join",
        label: "INNER JOIN",
        concept: "INNER JOIN",
        description: "Return only rows that have matches in both tables",
        sql: `SELECT
  c.id,
  c.first_name,
  c.last_name,
  c.skills,
  d.name AS department,
  d.location
FROM candidates c
INNER JOIN candidate_departments cd ON c.id = cd.candidate_id
INNER JOIN departments d ON cd.department_id = d.id
ORDER BY d.name, c.first_name;`,
      },
      {
        id: "mysql_left_join",
        label: "LEFT JOIN",
        concept: "LEFT JOIN",
        description: "Return all candidates even if they have no department",
        sql: `SELECT
  c.id,
  c.first_name,
  c.last_name,
  c.status,
  COALESCE(d.name, 'Unassigned') AS department
FROM candidates c
LEFT JOIN candidate_departments cd ON c.id = cd.candidate_id
LEFT JOIN departments d ON cd.department_id = d.id
ORDER BY c.first_name;`,
      },
      {
        id: "mysql_multi_join",
        label: "Multi-table JOIN",
        concept: "3-table JOIN",
        description: "Join three tables to get full candidate + department info",
        sql: `SELECT
  c.first_name,
  c.last_name,
  c.experience,
  c.skills,
  d.name AS department,
  d.location,
  d.budget
FROM candidates c
INNER JOIN candidate_departments cd ON c.id = cd.candidate_id
INNER JOIN departments d ON cd.department_id = d.id
WHERE c.status = 'Active'
ORDER BY d.name, c.experience DESC;`,
      },
      {
        id: "mysql_self_join",
        label: "Self JOIN",
        concept: "Self JOIN",
        description: "Join a table to itself — find candidates with the same last name",
        sql: `SELECT
  a.id AS id1,
  a.first_name AS first1,
  b.id AS id2,
  b.first_name AS first2,
  a.last_name AS shared_last_name
FROM candidates a
INNER JOIN candidates b
  ON a.last_name = b.last_name
  AND a.id < b.id
ORDER BY a.last_name;`,
      },
    ],
  },
  {
    category: "Aggregations",
    icon: "🧮",
    description: "GROUP BY and aggregate functions",
    queries: [
      {
        id: "mysql_group_status",
        label: "Group by Status",
        concept: "GROUP BY + COUNT",
        description: "Count candidates per status with percentage",
        sql: `SELECT
  status,
  COUNT(*) AS total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM candidates), 2) AS percentage,
  ROUND(AVG(experience), 1) AS avg_experience
FROM candidates
GROUP BY status
ORDER BY total DESC;`,
      },
      {
        id: "mysql_dept_stats",
        label: "Department Stats",
        concept: "JOIN + GROUP BY",
        description: "Aggregate candidates per department",
        sql: `SELECT
  d.name AS department,
  d.location,
  COUNT(c.id) AS total_candidates,
  ROUND(AVG(c.experience), 1) AS avg_experience,
  MAX(c.experience) AS max_experience,
  d.budget
FROM departments d
LEFT JOIN candidate_departments cd ON d.id = cd.department_id
LEFT JOIN candidates c ON cd.candidate_id = c.id
GROUP BY d.id, d.name, d.location, d.budget
ORDER BY total_candidates DESC;`,
      },
      {
        id: "mysql_having",
        label: "HAVING Filter",
        concept: "HAVING",
        description: "Filter groups — departments with more than 3 candidates",
        sql: `SELECT
  d.name AS department,
  COUNT(c.id) AS candidate_count,
  ROUND(AVG(c.experience), 1) AS avg_exp
FROM departments d
INNER JOIN candidate_departments cd ON d.id = cd.department_id
INNER JOIN candidates c ON cd.candidate_id = c.id
GROUP BY d.id, d.name
HAVING COUNT(c.id) > 3
ORDER BY candidate_count DESC;`,
      },
    ],
  },
  {
    category: "MySQL String Functions",
    icon: "🔤",
    description: "MySQL-specific string operations",
    queries: [
      {
        id: "mysql_string_funcs",
        label: "String Functions",
        concept: "CONCAT / SUBSTR / INSTR",
        description: "MySQL string functions — slightly different syntax to PostgreSQL",
        sql: `SELECT
  CONCAT(first_name, ' ', last_name)    AS full_name,
  UPPER(first_name)                      AS first_upper,
  LENGTH(email)                          AS email_length,
  SUBSTRING_INDEX(email, '@', -1)        AS domain,
  SUBSTRING_INDEX(email, '@', 1)         AS username,
  LEFT(phone, 3)                         AS area_code,
  REPLACE(email, '.com', '.io')          AS replaced_email
FROM candidates
WHERE phone IS NOT NULL
ORDER BY full_name
LIMIT 15;`,
      },
      {
        id: "mysql_regexp",
        label: "REGEXP Pattern",
        concept: "REGEXP",
        description: "MySQL regular expression matching",
        sql: `SELECT
  id,
  first_name,
  last_name,
  email
FROM candidates
WHERE email REGEXP '^[a-z].*\\.(com|gov|org)$'
ORDER BY first_name
LIMIT 20;`,
      },
    ],
  },
  {
    category: "MySQL Date Functions",
    icon: "📅",
    description: "MySQL temporal functions",
    queries: [
      {
        id: "mysql_date_funcs",
        label: "Date Functions",
        concept: "YEAR / MONTH / DATEDIFF",
        description: "MySQL date functions — different from PostgreSQL syntax",
        sql: `SELECT
  id,
  first_name,
  created_at,
  YEAR(created_at)                        AS year,
  MONTH(created_at)                       AS month,
  DAY(created_at)                         AS day,
  DATEDIFF(NOW(), created_at)             AS days_since,
  DATE_FORMAT(created_at, '%M %d, %Y')   AS formatted
FROM candidates
ORDER BY created_at DESC
LIMIT 15;`,
      },
      {
        id: "mysql_date_group",
        label: "Group by Month",
        concept: "DATE_FORMAT + GROUP BY",
        description: "Group records by month using MySQL's DATE_FORMAT",
        sql: `SELECT
  DATE_FORMAT(created_at, '%Y-%m') AS month,
  COUNT(*) AS new_candidates,
  GROUP_CONCAT(first_name ORDER BY first_name SEPARATOR ', ') AS names
FROM candidates
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month DESC;`,
      },
    ],
  },
  {
    category: "MySQL Specific",
    icon: "⚡",
    description: "MySQL-only features",
    queries: [
      {
        id: "mysql_group_concat",
        label: "GROUP_CONCAT",
        concept: "GROUP_CONCAT",
        description: "MySQL-only: aggregate rows into a comma-separated string",
        sql: `SELECT
  d.name AS department,
  COUNT(c.id) AS total,
  GROUP_CONCAT(
    c.first_name
    ORDER BY c.first_name
    SEPARATOR ', '
  ) AS candidate_names
FROM departments d
INNER JOIN candidate_departments cd ON d.id = cd.department_id
INNER JOIN candidates c ON cd.candidate_id = c.id
GROUP BY d.id, d.name
ORDER BY total DESC;`,
      },
      {
        id: "mysql_if",
        label: "IF Function",
        concept: "IF / IFNULL",
        description: "MySQL IF() — shorthand for simple CASE expressions",
        sql: `SELECT
  first_name,
  last_name,
  experience,
  IF(experience >= 7, 'Senior', IF(experience >= 4, 'Mid', 'Junior')) AS level,
  IFNULL(phone, 'No phone') AS phone_display,
  IF(status = 'Active', '✓', '✗') AS is_active
FROM candidates
ORDER BY experience DESC;`,
      },
      {
        id: "mysql_window",
        label: "Window Functions",
        concept: "ROW_NUMBER() OVER()",
        description: "MySQL 8+ supports window functions — rank per department",
        sql: `SELECT
  c.first_name,
  c.last_name,
  c.experience,
  d.name AS department,
  ROW_NUMBER() OVER (
    PARTITION BY d.name
    ORDER BY c.experience DESC
  ) AS rank_in_dept,
  ROUND(AVG(c.experience) OVER (PARTITION BY d.name), 1) AS dept_avg_exp
FROM candidates c
INNER JOIN candidate_departments cd ON c.id = cd.candidate_id
INNER JOIN departments d ON cd.department_id = d.id
ORDER BY d.name, rank_in_dept;`,
      },
      {
        id: "mysql_subquery",
        label: "Correlated Subquery",
        concept: "Correlated Subquery",
        description: "Subquery that references the outer query — find above-average earners per dept",
        sql: `SELECT
  c.first_name,
  c.last_name,
  c.experience,
  c.skills,
  (
    SELECT d.name
    FROM departments d
    INNER JOIN candidate_departments cd ON d.id = cd.department_id
    WHERE cd.candidate_id = c.id
    LIMIT 1
  ) AS primary_department
FROM candidates c
WHERE c.experience > (SELECT AVG(experience) FROM candidates)
ORDER BY c.experience DESC;`,
      },
      {
        id: "mysql_explain",
        label: "EXPLAIN Query Plan",
        concept: "EXPLAIN",
        description: "Show how MySQL executes a query — essential for performance tuning",
        sql: `EXPLAIN SELECT c.first_name, c.last_name, d.name AS department
FROM candidates c
INNER JOIN candidate_departments cd ON c.id = cd.candidate_id
INNER JOIN departments d ON cd.department_id = d.id
WHERE c.status = 'Active'
ORDER BY c.experience DESC;`,
      },
    ],
  },
  {
    category: "CTEs & Subqueries",
    icon: "🔄",
    description: "Advanced query patterns",
    queries: [
      {
        id: "mysql_cte",
        label: "CTE (WITH clause)",
        concept: "Common Table Expression",
        description: "MySQL 8+ CTEs — same as PostgreSQL WITH clause",
        sql: `WITH dept_stats AS (
  SELECT
    d.id,
    d.name,
    COUNT(c.id) AS headcount,
    ROUND(AVG(c.experience), 1) AS avg_exp
  FROM departments d
  LEFT JOIN candidate_departments cd ON d.id = cd.department_id
  LEFT JOIN candidates c ON cd.candidate_id = c.id
  GROUP BY d.id, d.name
),
top_depts AS (
  SELECT * FROM dept_stats WHERE headcount >= 3
)
SELECT
  name AS department,
  headcount,
  avg_exp,
  CASE
    WHEN avg_exp >= 7 THEN 'Senior Pool'
    WHEN avg_exp >= 4 THEN 'Mid Pool'
    ELSE 'Junior Pool'
  END AS pool_level
FROM top_depts
ORDER BY headcount DESC;`,
      },
      {
        id: "mysql_union",
        label: "UNION ALL",
        concept: "UNION / UNION ALL",
        description: "Combine results from multiple queries vertically",
        sql: `SELECT 'Active' AS category, COUNT(*) AS count, ROUND(AVG(experience),1) AS avg_exp
FROM candidates WHERE status = 'Active'
UNION ALL
SELECT 'Inactive', COUNT(*), ROUND(AVG(experience),1)
FROM candidates WHERE status = 'Inactive'
UNION ALL
SELECT 'Pending', COUNT(*), ROUND(AVG(experience),1)
FROM candidates WHERE status = 'Pending'
UNION ALL
SELECT 'TOTAL', COUNT(*), ROUND(AVG(experience),1)
FROM candidates;`,
      },
    ],
  },
];

export const allMySQLQueries = mysqlQueryCategories.flatMap((cat) =>
  cat.queries.map((q) => ({ ...q, category: cat.category, icon: cat.icon }))
);
