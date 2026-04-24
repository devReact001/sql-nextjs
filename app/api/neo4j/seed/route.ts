import { NextResponse } from "next/server";
import { executeNeo4jQuery } from "@/lib/neo4j";

const SEED_QUERIES = [
  // Clear existing data
  `MATCH (n) DETACH DELETE n`,

  // Create Candidates
  `CREATE
    (:Candidate {id:1,  name:'Alice Johnson',   email:'alice@gmail.com',   status:'active',       experience:5,  skills:'Python,ML,Data Engineering'}),
    (:Candidate {id:2,  name:'Bob Smith',        email:'bob@yahoo.com',     status:'interviewing', experience:3,  skills:'JavaScript,React,Node.js'}),
    (:Candidate {id:3,  name:'Carol Williams',   email:'carol@gmail.com',   status:'active',       experience:7,  skills:'Python,R,Statistics'}),
    (:Candidate {id:4,  name:'David Brown',      email:'david@outlook.com', status:'rejected',     experience:2,  skills:'SEO,Marketing'}),
    (:Candidate {id:5,  name:'Eva Davis',        email:'eva@gmail.com',     status:'active',       experience:8,  skills:'Java,Spring,Kubernetes'}),
    (:Candidate {id:6,  name:'Frank Miller',     email:'frank@yahoo.com',   status:'interviewing', experience:4,  skills:'Docker,Terraform,AWS'}),
    (:Candidate {id:7,  name:'Grace Wilson',     email:'grace@gmail.com',   status:'active',       experience:6,  skills:'Python,TensorFlow,CV'}),
    (:Candidate {id:8,  name:'Henry Moore',      email:'henry@outlook.com', status:'active',       experience:9,  skills:'Go,Rust,Systems'}),
    (:Candidate {id:9,  name:'Iris Taylor',      email:'iris@gmail.com',    status:'active',       experience:5,  skills:'TypeScript,React,Next.js'}),
    (:Candidate {id:10, name:'Jack Anderson',    email:'jack@yahoo.com',    status:'interviewing', experience:5,  skills:'Python,Django,REST'})`,

  // Create Departments
  `CREATE
    (:Department {id:'eng',      name:'Engineering',  budget:500000}),
    (:Department {id:'data',     name:'Data Science',  budget:300000}),
    (:Department {id:'devops',   name:'DevOps',        budget:200000}),
    (:Department {id:'product',  name:'Product',       budget:250000}),
    (:Department {id:'security', name:'Security',      budget:180000})`,

  // Create Skills
  `CREATE
    (:Skill {name:'Python'}),
    (:Skill {name:'JavaScript'}),
    (:Skill {name:'Java'}),
    (:Skill {name:'Go'}),
    (:Skill {name:'Rust'}),
    (:Skill {name:'Machine Learning'}),
    (:Skill {name:'Kubernetes'}),
    (:Skill {name:'AWS'}),
    (:Skill {name:'React'}),
    (:Skill {name:'Docker'})`,

  // Create Interviewers
  `CREATE
    (:Interviewer {id:101, name:'Sarah Chen',    title:'Engineering Manager'}),
    (:Interviewer {id:102, name:'Mark Torres',   title:'Senior Engineer'}),
    (:Interviewer {id:103, name:'Lisa Park',     title:'Data Science Lead'}),
    (:Interviewer {id:104, name:'James Wright',  title:'DevOps Lead'})`,

  // APPLIED_TO relationships (Candidate → Department)
  `MATCH (c:Candidate {id:1}),  (d:Department {id:'eng'})     CREATE (c)-[:APPLIED_TO {date:'2024-01-15', role:'Backend Engineer'}]->(d)`,
  `MATCH (c:Candidate {id:2}),  (d:Department {id:'eng'})     CREATE (c)-[:APPLIED_TO {date:'2024-02-10', role:'Frontend Engineer'}]->(d)`,
  `MATCH (c:Candidate {id:3}),  (d:Department {id:'data'})    CREATE (c)-[:APPLIED_TO {date:'2024-01-20', role:'Data Scientist'}]->(d)`,
  `MATCH (c:Candidate {id:4}),  (d:Department {id:'product'}) CREATE (c)-[:APPLIED_TO {date:'2024-03-05', role:'Product Manager'}]->(d)`,
  `MATCH (c:Candidate {id:5}),  (d:Department {id:'eng'})     CREATE (c)-[:APPLIED_TO {date:'2024-01-08', role:'Senior Engineer'}]->(d)`,
  `MATCH (c:Candidate {id:6}),  (d:Department {id:'devops'})  CREATE (c)-[:APPLIED_TO {date:'2024-02-28', role:'DevOps Engineer'}]->(d)`,
  `MATCH (c:Candidate {id:7}),  (d:Department {id:'data'})    CREATE (c)-[:APPLIED_TO {date:'2024-01-25', role:'ML Engineer'}]->(d)`,
  `MATCH (c:Candidate {id:8}),  (d:Department {id:'eng'})     CREATE (c)-[:APPLIED_TO {date:'2024-02-01', role:'Principal Engineer'}]->(d)`,
  `MATCH (c:Candidate {id:9}),  (d:Department {id:'eng'})     CREATE (c)-[:APPLIED_TO {date:'2024-02-05', role:'Fullstack Engineer'}]->(d)`,
  `MATCH (c:Candidate {id:10}), (d:Department {id:'eng'})     CREATE (c)-[:APPLIED_TO {date:'2024-02-15', role:'Backend Engineer'}]->(d)`,

  // INTERVIEWED_BY relationships (Candidate → Interviewer)
  `MATCH (c:Candidate {id:1}),  (i:Interviewer {id:101}) CREATE (c)-[:INTERVIEWED_BY {round:1, score:92, feedback:'Excellent technical skills'}]->(i)`,
  `MATCH (c:Candidate {id:2}),  (i:Interviewer {id:102}) CREATE (c)-[:INTERVIEWED_BY {round:1, score:78, feedback:'Good frontend, weak backend'}]->(i)`,
  `MATCH (c:Candidate {id:3}),  (i:Interviewer {id:103}) CREATE (c)-[:INTERVIEWED_BY {round:1, score:95, feedback:'Outstanding researcher'}]->(i)`,
  `MATCH (c:Candidate {id:5}),  (i:Interviewer {id:101}) CREATE (c)-[:INTERVIEWED_BY {round:1, score:88, feedback:'Strong system design'}]->(i)`,
  `MATCH (c:Candidate {id:5}),  (i:Interviewer {id:102}) CREATE (c)-[:INTERVIEWED_BY {round:2, score:91, feedback:'Passed technical challenge'}]->(i)`,
  `MATCH (c:Candidate {id:6}),  (i:Interviewer {id:104}) CREATE (c)-[:INTERVIEWED_BY {round:1, score:83, feedback:'Solid cloud knowledge'}]->(i)`,
  `MATCH (c:Candidate {id:7}),  (i:Interviewer {id:103}) CREATE (c)-[:INTERVIEWED_BY {round:1, score:96, feedback:'Deep ML expertise'}]->(i)`,
  `MATCH (c:Candidate {id:8}),  (i:Interviewer {id:101}) CREATE (c)-[:INTERVIEWED_BY {round:1, score:99, feedback:'Exceptional, immediate offer'}]->(i)`,
  `MATCH (c:Candidate {id:9}),  (i:Interviewer {id:102}) CREATE (c)-[:INTERVIEWED_BY {round:1, score:85, feedback:'Clean code, good patterns'}]->(i)`,
  `MATCH (c:Candidate {id:10}), (i:Interviewer {id:101}) CREATE (c)-[:INTERVIEWED_BY {round:1, score:80, feedback:'Good Python skills'}]->(i)`,

  // HAS_SKILL relationships (Candidate → Skill)
  `MATCH (c:Candidate {id:1}), (s:Skill {name:'Python'})         CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:1}), (s:Skill {name:'Machine Learning'}) CREATE (c)-[:HAS_SKILL {level:'advanced'}]->(s)`,
  `MATCH (c:Candidate {id:2}), (s:Skill {name:'JavaScript'})     CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:2}), (s:Skill {name:'React'})          CREATE (c)-[:HAS_SKILL {level:'advanced'}]->(s)`,
  `MATCH (c:Candidate {id:3}), (s:Skill {name:'Python'})         CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:3}), (s:Skill {name:'Machine Learning'}) CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:5}), (s:Skill {name:'Java'})           CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:5}), (s:Skill {name:'Kubernetes'})     CREATE (c)-[:HAS_SKILL {level:'advanced'}]->(s)`,
  `MATCH (c:Candidate {id:6}), (s:Skill {name:'Docker'})         CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:6}), (s:Skill {name:'AWS'})            CREATE (c)-[:HAS_SKILL {level:'advanced'}]->(s)`,
  `MATCH (c:Candidate {id:6}), (s:Skill {name:'Kubernetes'})     CREATE (c)-[:HAS_SKILL {level:'intermediate'}]->(s)`,
  `MATCH (c:Candidate {id:7}), (s:Skill {name:'Python'})         CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:7}), (s:Skill {name:'Machine Learning'}) CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:8}), (s:Skill {name:'Go'})             CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:8}), (s:Skill {name:'Rust'})           CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:9}), (s:Skill {name:'JavaScript'})     CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:9}), (s:Skill {name:'React'})          CREATE (c)-[:HAS_SKILL {level:'expert'}]->(s)`,
  `MATCH (c:Candidate {id:10}),(s:Skill {name:'Python'})         CREATE (c)-[:HAS_SKILL {level:'advanced'}]->(s)`,

  // REFERRED_BY relationships (Candidate → Candidate)
  `MATCH (a:Candidate {id:1}), (b:Candidate {id:3})  CREATE (a)-[:REFERRED_BY {date:'2024-01-10'}]->(b)`,
  `MATCH (a:Candidate {id:7}), (b:Candidate {id:3})  CREATE (a)-[:REFERRED_BY {date:'2024-01-22'}]->(b)`,
  `MATCH (a:Candidate {id:9}), (b:Candidate {id:2})  CREATE (a)-[:REFERRED_BY {date:'2024-01-30'}]->(b)`,
  `MATCH (a:Candidate {id:6}), (b:Candidate {id:5})  CREATE (a)-[:REFERRED_BY {date:'2024-02-20'}]->(b)`,
  `MATCH (a:Candidate {id:10}),(b:Candidate {id:1})  CREATE (a)-[:REFERRED_BY {date:'2024-02-12'}]->(b)`,
];

export async function POST() {
  const results: string[] = [];
  let errorCount = 0;

  for (const query of SEED_QUERIES) {
    const result = await executeNeo4jQuery(query);
    if (result.error) {
      results.push(`❌ ${query.slice(0, 60)}... → ${result.error}`);
      errorCount++;
    } else {
      results.push(`✅ OK`);
    }
  }

  return NextResponse.json({
    success: errorCount === 0,
    total: SEED_QUERIES.length,
    errors: errorCount,
    log: results,
  });
}
