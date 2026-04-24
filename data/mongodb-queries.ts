export interface QueryCategory {
  category: string;
  icon: string;
  description: string;
  queries: QueryItem[];
}

export interface QueryItem {
  id: string;
  label: string;
  operation: object; // MongoDB operation object
  description: string;
  concept: string;
  apiPath: string;
}

export const mongoQueryCategories: QueryCategory[] = [
  {
    category: "Basic Queries",
    icon: "🍃",
    description: "find(), filter, projection — querying documents",
    queries: [
      {
        id: "mongo_find_all",
        label: "Find All Candidates",
        concept: "find({})",
        description: "Return all documents in a collection — like SELECT * FROM candidates",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: {},
          limit: 20,
        },
      },
      {
        id: "mongo_projection",
        label: "Select Specific Fields",
        concept: "projection",
        description: "Return only certain fields — like SELECT name, status, score FROM candidates",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: {},
          projection: { name: 1, department: 1, status: 1, score: 1, experience: 1 },
          limit: 20,
        },
      },
      {
        id: "mongo_filter_status",
        label: "Filter by Field",
        concept: "filter equality",
        description: "Match documents by a field value — like WHERE status = 'active'",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: { status: "active" },
          projection: { name: 1, department: 1, status: 1, score: 1 },
          limit: 20,
        },
      },
      {
        id: "mongo_sort",
        label: "Sort Results",
        concept: "sort()",
        description: "Order documents by a field — like ORDER BY score DESC",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: {},
          projection: { name: 1, score: 1, department: 1, experience: 1 },
          sort: { score: -1 },
          limit: 10,
        },
      },
    ],
  },
  {
    category: "Filtering",
    icon: "🔎",
    description: "Comparison operators — $gt, $in, $regex, $and, $or",
    queries: [
      {
        id: "mongo_gt",
        label: "Range Filter ($gt, $lt)",
        concept: "$gt / $lt",
        description: "Filter by numeric range — like WHERE experience >= 5 AND score > 85",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: { experience: { $gte: 5 }, score: { $gt: 85 } },
          projection: { name: 1, experience: 1, score: 1, department: 1 },
          sort: { score: -1 },
          limit: 20,
        },
      },
      {
        id: "mongo_in",
        label: "Match Multiple Values ($in)",
        concept: "$in",
        description: "Match any of a set of values — like WHERE status IN ('active', 'interviewing')",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: { status: { $in: ["active", "interviewing"] } },
          projection: { name: 1, status: 1, department: 1, score: 1 },
          limit: 20,
        },
      },
      {
        id: "mongo_array_contains",
        label: "Array Contains ($elemMatch)",
        concept: "array query",
        description: "Find documents where an array field contains a value — unique to document DBs",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: { skills: "Python" },
          projection: { name: 1, skills: 1, department: 1, score: 1 },
          sort: { score: -1 },
          limit: 20,
        },
      },
      {
        id: "mongo_or",
        label: "OR Conditions ($or)",
        concept: "$or",
        description: "Match documents where at least one condition is true — like WHERE a OR b",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: {
            $or: [
              { department: "Data Science" },
              { score: { $gte: 95 } },
            ],
          },
          projection: { name: 1, department: 1, score: 1, status: 1 },
          sort: { score: -1 },
          limit: 20,
        },
      },
      {
        id: "mongo_and",
        label: "AND Conditions ($and)",
        concept: "$and",
        description: "All conditions must match — like WHERE dept = 'Engineering' AND experience > 5",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: {
            $and: [
              { department: "Engineering" },
              { experience: { $gt: 5 } },
              { status: "active" },
            ],
          },
          projection: { name: 1, department: 1, experience: 1, score: 1 },
          sort: { experience: -1 },
          limit: 20,
        },
      },
    ],
  },
  {
    category: "Aggregation Pipeline",
    icon: "⚙️",
    description: "$match, $group, $sort, $project — MongoDB's most powerful feature",
    queries: [
      {
        id: "mongo_group_by_dept",
        label: "Group By Department",
        concept: "$group",
        description: "Count and average by department — like GROUP BY in SQL",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "aggregate",
          collection: "candidates",
          pipeline: [
            { $group: { _id: "$department", count: { $sum: 1 }, avgScore: { $avg: "$score" }, avgExperience: { $avg: "$experience" } } },
            { $sort: { count: -1 } },
            { $project: { department: "$_id", count: 1, avgScore: { $round: ["$avgScore", 1] }, avgExperience: { $round: ["$avgExperience", 1] }, _id: 0 } },
          ],
        },
      },
      {
        id: "mongo_match_group",
        label: "$match then $group",
        concept: "$match + $group",
        description: "Filter then aggregate — like WHERE + GROUP BY in SQL",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "aggregate",
          collection: "candidates",
          pipeline: [
            { $match: { status: "active" } },
            { $group: { _id: "$department", activeCount: { $sum: 1 }, topScore: { $max: "$score" } } },
            { $sort: { activeCount: -1 } },
            { $project: { department: "$_id", activeCount: 1, topScore: 1, _id: 0 } },
          ],
        },
      },
      {
        id: "mongo_unwind",
        label: "$unwind Array Field",
        concept: "$unwind",
        description: "Explode array into separate documents — no SQL equivalent, document-DB specific",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "aggregate",
          collection: "candidates",
          pipeline: [
            { $match: { status: "active" } },
            { $unwind: "$skills" },
            { $group: { _id: "$skills", candidateCount: { $sum: 1 }, avgScore: { $avg: "$score" } } },
            { $sort: { candidateCount: -1 } },
            { $project: { skill: "$_id", candidateCount: 1, avgScore: { $round: ["$avgScore", 1] }, _id: 0 } },
            { $limit: 15 },
          ],
        },
      },
      {
        id: "mongo_lookup",
        label: "$lookup — Join Collections",
        concept: "$lookup",
        description: "Join two collections — like LEFT JOIN in SQL, but on documents",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "aggregate",
          collection: "candidates",
          pipeline: [
            { $match: { status: { $in: ["active", "interviewing"] } } },
            {
              $lookup: {
                from: "interviews",
                localField: "name",
                foreignField: "candidateName",
                as: "interviewHistory",
              },
            },
            { $project: { name: 1, department: 1, status: 1, score: 1, interviewCount: { $size: "$interviewHistory" } } },
            { $sort: { interviewCount: -1 } },
            { $limit: 15 },
          ],
        },
      },
      {
        id: "mongo_bucket",
        label: "$bucket — Score Ranges",
        concept: "$bucket",
        description: "Group values into ranges — like CASE WHEN score BETWEEN ... in SQL",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "aggregate",
          collection: "candidates",
          pipeline: [
            {
              $bucket: {
                groupBy: "$score",
                boundaries: [0, 60, 70, 80, 90, 100],
                default: "Other",
                output: { count: { $sum: 1 }, candidates: { $push: "$name" } },
              },
            },
          ],
        },
      },
    ],
  },
  {
    category: "Array Operations",
    icon: "📦",
    description: "Arrays are first-class in MongoDB — powerful array query operators",
    queries: [
      {
        id: "mongo_array_size",
        label: "Filter by Array Size",
        concept: "$size",
        description: "Find documents where an array has exactly N elements — no SQL equivalent",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: { skills: { $size: 2 } },
          projection: { name: 1, skills: 1, department: 1 },
          limit: 20,
        },
      },
      {
        id: "mongo_all",
        label: "Array Contains All ($all)",
        concept: "$all",
        description: "Find docs where array contains ALL specified values — like multiple LIKE conditions",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: { skills: { $all: ["Python", "Machine Learning"] } },
          projection: { name: 1, skills: 1, score: 1, department: 1 },
          sort: { score: -1 },
          limit: 20,
        },
      },
      {
        id: "mongo_distinct",
        label: "Distinct Values",
        concept: "distinct()",
        description: "Get all unique values for a field — like SELECT DISTINCT in SQL",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "distinct",
          collection: "candidates",
          field: "department",
        },
      },
      {
        id: "mongo_tags_filter",
        label: "Filter by Tag Array",
        concept: "array element match",
        description: "Find candidates with a specific tag — arrays make tagging natural in MongoDB",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "candidates",
          filter: { tags: "senior" },
          projection: { name: 1, tags: 1, department: 1, score: 1, experience: 1 },
          sort: { score: -1 },
          limit: 20,
        },
      },
    ],
  },
  {
    category: "Advanced Aggregations",
    icon: "🧠",
    description: "facets, add fields, conditional expressions",
    queries: [
      {
        id: "mongo_addfields",
        label: "$addFields — Computed Column",
        concept: "$addFields",
        description: "Add a computed field to each document — like a derived column in SQL",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "aggregate",
          collection: "candidates",
          pipeline: [
            {
              $addFields: {
                scoreGrade: {
                  $switch: {
                    branches: [
                      { case: { $gte: ["$score", 90] }, then: "A" },
                      { case: { $gte: ["$score", 80] }, then: "B" },
                      { case: { $gte: ["$score", 70] }, then: "C" },
                    ],
                    default: "F",
                  },
                },
                seniorityLevel: {
                  $switch: {
                    branches: [
                      { case: { $gte: ["$experience", 8] }, then: "Principal" },
                      { case: { $gte: ["$experience", 5] }, then: "Senior" },
                      { case: { $gte: ["$experience", 3] }, then: "Mid" },
                    ],
                    default: "Junior",
                  },
                },
              },
            },
            { $project: { name: 1, score: 1, scoreGrade: 1, experience: 1, seniorityLevel: 1, department: 1 } },
            { $sort: { score: -1 } },
          ],
        },
      },
      {
        id: "mongo_facet",
        label: "$facet — Multi-Dimension Stats",
        concept: "$facet",
        description: "Run multiple aggregations in a single query — like multiple GROUP BY at once",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "aggregate",
          collection: "candidates",
          pipeline: [
            {
              $facet: {
                byStatus: [
                  { $group: { _id: "$status", count: { $sum: 1 } } },
                  { $sort: { count: -1 } },
                ],
                byDepartment: [
                  { $group: { _id: "$department", count: { $sum: 1 } } },
                  { $sort: { count: -1 } },
                ],
                scoreStats: [
                  { $group: { _id: null, avg: { $avg: "$score" }, max: { $max: "$score" }, min: { $min: "$score" } } },
                ],
              },
            },
          ],
        },
      },
      {
        id: "mongo_interview_stats",
        label: "Interview Performance Stats",
        concept: "$lookup + $group",
        description: "Join interviews to candidates then compute stats — multi-collection aggregation",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "aggregate",
          collection: "interviews",
          pipeline: [
            { $group: { _id: "$candidateName", rounds: { $sum: 1 }, avgScore: { $avg: "$score" }, passed: { $sum: { $cond: ["$passed", 1, 0] } } } },
            { $sort: { avgScore: -1 } },
            { $project: { candidate: "$_id", rounds: 1, avgScore: { $round: ["$avgScore", 1] }, passed: 1, _id: 0 } },
          ],
        },
      },
      {
        id: "mongo_count",
        label: "Count Documents",
        concept: "countDocuments()",
        description: "Count documents matching a filter — like SELECT COUNT(*) WHERE ...",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "countDocuments",
          collection: "candidates",
          filter: { status: "active" },
        },
      },
    ],
  },
  {
    category: "Jobs Collection",
    icon: "💼",
    description: "Query the jobs collection — nested documents and salary ranges",
    queries: [
      {
        id: "mongo_jobs_all",
        label: "All Job Openings",
        concept: "find nested docs",
        description: "List all jobs with nested salary objects — documents can contain sub-documents",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "jobs",
          filter: {},
          sort: { "salary.max": -1 },
          limit: 20,
        },
      },
      {
        id: "mongo_salary_filter",
        label: "Filter by Nested Field",
        concept: "dot notation",
        description: "Query inside a nested object using dot notation — no JOIN needed",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "find",
          collection: "jobs",
          filter: { "salary.min": { $gte: 140000 }, remote: true },
          projection: { title: 1, department: 1, level: 1, salary: 1, remote: 1 },
          sort: { "salary.max": -1 },
          limit: 20,
        },
      },
      {
        id: "mongo_jobs_group",
        label: "Salary Stats by Level",
        concept: "$group on nested field",
        description: "Average salary range per seniority level — aggregating on nested fields",
        apiPath: "/api/mongodb/query",
        operation: {
          op: "aggregate",
          collection: "jobs",
          pipeline: [
            { $group: { _id: "$level", jobCount: { $sum: "$openings" }, avgMinSalary: { $avg: "$salary.min" }, avgMaxSalary: { $avg: "$salary.max" } } },
            { $sort: { avgMaxSalary: -1 } },
            { $project: { level: "$_id", jobCount: 1, avgMinSalary: { $round: ["$avgMinSalary", 0] }, avgMaxSalary: { $round: ["$avgMaxSalary", 0] }, _id: 0 } },
          ],
        },
      },
    ],
  },
];

export const allMongoQueries: QueryItem[] = mongoQueryCategories.flatMap(
  (cat) => cat.queries
);
