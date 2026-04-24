export interface QueryCategory {
  category: string;
  icon: string;
  description: string;
  queries: QueryItem[];
}

export interface QueryItem {
  id: string;
  label: string;
  cypher: string;
  description: string;
  concept: string;
  apiPath: string;
}

export const neo4jQueryCategories: QueryCategory[] = [
  {
    category: "Graph Basics",
    icon: "🔵",
    description: "Nodes, labels, properties — the building blocks of a graph",
    queries: [
      {
        id: "neo_match_all_candidates",
        label: "All Candidates",
        concept: "MATCH nodes",
        description: "Return all Candidate nodes — like SELECT * FROM candidates",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)
RETURN c.id AS id, c.name AS name, c.status AS status, c.experience AS experience
ORDER BY c.id`,
      },
      {
        id: "neo_match_departments",
        label: "All Departments",
        concept: "MATCH label",
        description: "Return all Department nodes — each label is like a table",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (d:Department)
RETURN d.id AS id, d.name AS name, d.budget AS budget`,
      },
      {
        id: "neo_match_skills",
        label: "All Skills",
        concept: "MATCH label",
        description: "Return all Skill nodes in the graph",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (s:Skill)
RETURN s.name AS skill
ORDER BY s.name`,
      },
      {
        id: "neo_where_filter",
        label: "Filter by Property",
        concept: "WHERE",
        description: "Filter nodes by property — like WHERE status = 'active'",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)
WHERE c.status = 'active' AND c.experience >= 5
RETURN c.name AS name, c.status AS status, c.experience AS experience
ORDER BY c.experience DESC`,
      },
      {
        id: "neo_count_nodes",
        label: "Count by Label",
        concept: "COUNT",
        description: "Count all nodes per label — like SELECT COUNT(*) GROUP BY type",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate) WITH 'Candidate' AS label, count(c) AS total
UNION ALL
MATCH (d:Department) WITH 'Department' AS label, count(d) AS total
UNION ALL
MATCH (s:Skill) WITH 'Skill' AS label, count(s) AS total
UNION ALL
MATCH (i:Interviewer) WITH 'Interviewer' AS label, count(i) AS total
RETURN label, total ORDER BY total DESC`,
      },
    ],
  },
  {
    category: "Relationships",
    icon: "🔗",
    description: "Traverse edges between nodes — the core power of graph databases",
    queries: [
      {
        id: "neo_applied_to",
        label: "Who Applied Where",
        concept: "-[:APPLIED_TO]->",
        description: "Traverse APPLIED_TO edges — relationships are first-class in graphs",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)-[r:APPLIED_TO]->(d:Department)
RETURN c.name AS candidate, d.name AS department, r.role AS role, r.date AS applied_date
ORDER BY r.date`,
      },
      {
        id: "neo_interviewed_by",
        label: "Interview History",
        concept: "-[:INTERVIEWED_BY]->",
        description: "Who interviewed whom, with scores — edges carry properties too",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)-[r:INTERVIEWED_BY]->(i:Interviewer)
RETURN c.name AS candidate, i.name AS interviewer, i.title AS interviewer_title,
       r.round AS round, r.score AS score, r.feedback AS feedback
ORDER BY r.score DESC`,
      },
      {
        id: "neo_has_skill",
        label: "Candidate Skills",
        concept: "-[:HAS_SKILL]->",
        description: "Which candidates have which skills, and at what level",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)-[r:HAS_SKILL]->(s:Skill)
RETURN c.name AS candidate, s.name AS skill, r.level AS proficiency
ORDER BY c.name, r.level`,
      },
      {
        id: "neo_referrals",
        label: "Referral Network",
        concept: "-[:REFERRED_BY]->",
        description: "Who referred whom — a social graph within the hiring data",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (a:Candidate)-[r:REFERRED_BY]->(b:Candidate)
RETURN a.name AS applicant, b.name AS referred_by, r.date AS referral_date
ORDER BY r.date`,
      },
    ],
  },
  {
    category: "Pattern Matching",
    icon: "🧩",
    description: "Multi-hop traversals — what SQL JOINs can't do elegantly",
    queries: [
      {
        id: "neo_two_hop",
        label: "2-Hop: Candidate → Dept → Skills",
        concept: "multi-hop MATCH",
        description: "Traverse two relationship types in one query — impossible elegantly in SQL",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)-[:APPLIED_TO]->(d:Department)
MATCH (c)-[:HAS_SKILL]->(s:Skill)
RETURN c.name AS candidate, d.name AS department, collect(s.name) AS skills
ORDER BY c.name`,
      },
      {
        id: "neo_friend_of_friend",
        label: "Referral Chain (2 levels)",
        concept: "variable-length path",
        description: "Find candidates connected through referrals up to 2 hops away",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH path = (a:Candidate)-[:REFERRED_BY*1..2]->(b:Candidate)
RETURN a.name AS from_candidate, b.name AS to_candidate,
       length(path) AS hops
ORDER BY hops, a.name`,
      },
      {
        id: "neo_interviewers_dept",
        label: "Interviewers per Department",
        concept: "2-hop traversal",
        description: "Which interviewers are evaluating candidates for each department",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)-[:APPLIED_TO]->(d:Department)
MATCH (c)-[:INTERVIEWED_BY]->(i:Interviewer)
RETURN d.name AS department, collect(DISTINCT i.name) AS interviewers,
       count(DISTINCT c) AS candidates_interviewed
ORDER BY candidates_interviewed DESC`,
      },
      {
        id: "neo_skill_overlap",
        label: "Shared Skills Between Candidates",
        concept: "common neighbor",
        description: "Find pairs of candidates who share the same skill — graph-native query",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (a:Candidate)-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(b:Candidate)
WHERE a.id < b.id
RETURN a.name AS candidate_1, b.name AS candidate_2,
       collect(s.name) AS shared_skills,
       count(s) AS skill_overlap
ORDER BY skill_overlap DESC`,
      },
    ],
  },
  {
    category: "Aggregations",
    icon: "📊",
    description: "GROUP BY, COUNT, AVG — familiar SQL concepts in Cypher",
    queries: [
      {
        id: "neo_candidates_per_dept",
        label: "Candidates per Department",
        concept: "count + GROUP BY",
        description: "Count applications per department — like GROUP BY in SQL",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)-[:APPLIED_TO]->(d:Department)
RETURN d.name AS department, count(c) AS applicants
ORDER BY applicants DESC`,
      },
      {
        id: "neo_avg_score_interviewer",
        label: "Avg Interview Score per Interviewer",
        concept: "avg aggregation",
        description: "Average score given by each interviewer — like AVG + GROUP BY",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)-[r:INTERVIEWED_BY]->(i:Interviewer)
RETURN i.name AS interviewer, i.title AS title,
       count(r) AS interviews_done,
       round(avg(r.score), 1) AS avg_score,
       min(r.score) AS min_score,
       max(r.score) AS max_score
ORDER BY avg_score DESC`,
      },
      {
        id: "neo_skill_popularity",
        label: "Most Common Skills",
        concept: "count + ORDER BY",
        description: "Which skills appear most across all candidates",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)-[:HAS_SKILL]->(s:Skill)
RETURN s.name AS skill, count(c) AS candidates_with_skill
ORDER BY candidates_with_skill DESC`,
      },
      {
        id: "neo_avg_exp_per_dept",
        label: "Avg Experience per Department",
        concept: "avg on node property",
        description: "Average candidate experience per department — traversal + aggregation",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)-[:APPLIED_TO]->(d:Department)
RETURN d.name AS department,
       round(avg(c.experience), 1) AS avg_experience,
       min(c.experience) AS min_exp,
       max(c.experience) AS max_exp
ORDER BY avg_experience DESC`,
      },
    ],
  },
  {
    category: "Graph Algorithms",
    icon: "🧠",
    description: "Queries only possible in a graph — shortest paths, centrality",
    queries: [
      {
        id: "neo_shortest_path",
        label: "Shortest Path Between Nodes",
        concept: "shortestPath()",
        description: "Find the shortest connection between two candidates through any relationship",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (a:Candidate {id: 1}), (b:Candidate {id: 7})
MATCH path = shortestPath((a)-[*]-(b))
RETURN [n IN nodes(path) | coalesce(n.name, n.title, '')] AS path_nodes,
       length(path) AS hops`,
      },
      {
        id: "neo_most_connected",
        label: "Most Connected Candidates",
        concept: "degree centrality",
        description: "Count total relationships per candidate — degree centrality in graph theory",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)
OPTIONAL MATCH (c)-[r]-()
RETURN c.name AS candidate, c.status AS status,
       count(r) AS total_connections
ORDER BY total_connections DESC`,
      },
      {
        id: "neo_influential_referrers",
        label: "Top Referrers",
        concept: "in-degree centrality",
        description: "Who is referred to the most — influential nodes in the referral graph",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (b:Candidate)<-[:REFERRED_BY]-(a:Candidate)
RETURN b.name AS referrer, count(a) AS times_referred,
       collect(a.name) AS referred_candidates
ORDER BY times_referred DESC`,
      },
      {
        id: "neo_all_paths",
        label: "All Paths (up to 3 hops)",
        concept: "allShortestPaths",
        description: "Find all shortest paths between two nodes — multiple routes through the graph",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (a:Candidate {id:1}), (b:Interviewer {id:103})
MATCH path = allShortestPaths((a)-[*..3]-(b))
RETURN [n IN nodes(path) | coalesce(n.name, n.title, '')] AS path,
       length(path) AS length
ORDER BY length LIMIT 5`,
      },
    ],
  },
  {
    category: "Advanced Cypher",
    icon: "⚡",
    description: "WITH, COLLECT, UNWIND — powerful Cypher-specific features",
    queries: [
      {
        id: "neo_collect",
        label: "COLLECT — Group into List",
        concept: "collect()",
        description: "Aggregate values into a list — like array_agg() in PostgreSQL",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)-[:HAS_SKILL]->(s:Skill)
RETURN c.name AS candidate,
       collect(s.name) AS skills,
       count(s) AS skill_count
ORDER BY skill_count DESC`,
      },
      {
        id: "neo_with_filter",
        label: "WITH — Pipeline Filter",
        concept: "WITH clause",
        description: "Chain query stages with WITH — like CTEs in SQL",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)-[r:INTERVIEWED_BY]->(i:Interviewer)
WITH c, avg(r.score) AS avg_score
WHERE avg_score >= 85
MATCH (c)-[:APPLIED_TO]->(d:Department)
RETURN c.name AS candidate, d.name AS department,
       round(avg_score, 1) AS average_score
ORDER BY average_score DESC`,
      },
      {
        id: "neo_optional_match",
        label: "OPTIONAL MATCH — Left Join",
        concept: "OPTIONAL MATCH",
        description: "Include nodes even without a relationship — like LEFT JOIN in SQL",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)
OPTIONAL MATCH (c)-[r:INTERVIEWED_BY]->(i:Interviewer)
RETURN c.name AS candidate, c.status AS status,
       CASE WHEN i IS NULL THEN 'Not yet interviewed'
            ELSE i.name END AS interviewer,
       CASE WHEN r IS NULL THEN '-'
            ELSE toString(r.score) END AS score
ORDER BY c.id`,
      },
      {
        id: "neo_exists",
        label: "EXISTS — Subquery Filter",
        concept: "EXISTS {}",
        description: "Filter based on whether a pattern exists — like SQL's EXISTS subquery",
        apiPath: "/api/neo4j/query",
        cypher: `MATCH (c:Candidate)
WHERE EXISTS { (c)-[:INTERVIEWED_BY]->(:Interviewer) }
  AND EXISTS { (c)-[:HAS_SKILL]->(:Skill {name: 'Python'}) }
RETURN c.name AS candidate, c.status AS status, c.experience AS experience
ORDER BY c.experience DESC`,
      },
    ],
  },
];

export const allNeo4jQueries: QueryItem[] = neo4jQueryCategories.flatMap(
  (cat) => cat.queries
);
