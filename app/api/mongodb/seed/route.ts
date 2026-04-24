import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const candidates = [
  { name: "Alice Johnson",   email: "alice@gmail.com",   status: "active",       department: "Engineering",  experience: 5,  skills: ["Python", "Machine Learning", "Data Engineering"], score: 92, appliedDate: new Date("2024-01-15"), tags: ["senior", "ml-track"] },
  { name: "Bob Smith",       email: "bob@yahoo.com",     status: "interviewing", department: "Engineering",  experience: 3,  skills: ["JavaScript", "React", "Node.js"],                  score: 78, appliedDate: new Date("2024-02-10"), tags: ["frontend", "junior"] },
  { name: "Carol Williams",  email: "carol@gmail.com",   status: "active",       department: "Data Science", experience: 7,  skills: ["Python", "R", "Statistics", "Machine Learning"],   score: 95, appliedDate: new Date("2024-01-20"), tags: ["senior", "research"] },
  { name: "David Brown",     email: "david@outlook.com", status: "rejected",     department: "Marketing",    experience: 2,  skills: ["SEO", "Content Marketing"],                         score: 55, appliedDate: new Date("2024-03-05"), tags: ["junior"] },
  { name: "Eva Davis",       email: "eva@gmail.com",     status: "active",       department: "Engineering",  experience: 8,  skills: ["Java", "Spring Boot", "Kubernetes", "Microservices"],score: 88, appliedDate: new Date("2024-01-08"), tags: ["senior", "backend"] },
  { name: "Frank Miller",    email: "frank@yahoo.com",   status: "interviewing", department: "DevOps",       experience: 4,  skills: ["Docker", "Kubernetes", "Terraform", "AWS"],         score: 83, appliedDate: new Date("2024-02-28"), tags: ["cloud", "infra"] },
  { name: "Grace Wilson",    email: "grace@gmail.com",   status: "active",       department: "Data Science", experience: 6,  skills: ["Python", "TensorFlow", "Deep Learning", "CV"],      score: 96, appliedDate: new Date("2024-01-25"), tags: ["senior", "ml-track"] },
  { name: "Henry Moore",     email: "henry@outlook.com", status: "active",       department: "Engineering",  experience: 9,  skills: ["Go", "Rust", "Systems Programming"],                score: 99, appliedDate: new Date("2024-02-01"), tags: ["principal", "backend"] },
  { name: "Iris Taylor",     email: "iris@gmail.com",    status: "active",       department: "Engineering",  experience: 5,  skills: ["TypeScript", "React", "Next.js"],                   score: 85, appliedDate: new Date("2024-02-05"), tags: ["fullstack"] },
  { name: "Jack Anderson",   email: "jack@yahoo.com",    status: "interviewing", department: "Engineering",  experience: 5,  skills: ["Python", "Django", "REST API"],                     score: 80, appliedDate: new Date("2024-02-15"), tags: ["backend"] },
  { name: "Karen Thomas",    email: "karen@gmail.com",   status: "active",       department: "Product",      experience: 6,  skills: ["Product Management", "Agile", "Roadmapping"],       score: 87, appliedDate: new Date("2024-01-30"), tags: ["pm", "senior"] },
  { name: "Liam Jackson",    email: "liam@outlook.com",  status: "active",       department: "Engineering",  experience: 4,  skills: ["TypeScript", "React", "Next.js", "Fullstack"],      score: 82, appliedDate: new Date("2024-02-05"), tags: ["fullstack"] },
  { name: "Mia White",       email: "mia@gmail.com",     status: "interviewing", department: "Data Science", experience: 3,  skills: ["Python", "Pandas", "SQL", "Visualization"],         score: 77, appliedDate: new Date("2024-03-01"), tags: ["junior", "analytics"] },
  { name: "Noah Harris",     email: "noah@yahoo.com",    status: "active",       department: "DevOps",       experience: 7,  skills: ["AWS", "GCP", "Kubernetes", "CI/CD"],                score: 91, appliedDate: new Date("2024-01-12"), tags: ["senior", "cloud"] },
  { name: "Olivia Martin",   email: "olivia@gmail.com",  status: "active",       department: "Engineering",  experience: 5,  skills: ["Swift", "iOS", "Objective-C"],                      score: 86, appliedDate: new Date("2024-02-18"), tags: ["mobile", "ios"] },
  { name: "Paul Garcia",     email: "paul@outlook.com",  status: "rejected",     department: "Engineering",  experience: 1,  skills: ["HTML", "CSS", "JavaScript"],                        score: 48, appliedDate: new Date("2024-03-20"), tags: ["junior"] },
  { name: "Quinn Martinez",  email: "quinn@gmail.com",   status: "active",       department: "Security",     experience: 8,  skills: ["Cybersecurity", "Penetration Testing", "SIEM"],     score: 94, appliedDate: new Date("2024-01-05"), tags: ["senior", "security"] },
  { name: "Rachel Robinson", email: "rachel@yahoo.com",  status: "interviewing", department: "Data Science", experience: 5,  skills: ["Python", "Spark", "Hadoop", "Big Data"],            score: 84, appliedDate: new Date("2024-02-22"), tags: ["data-eng"] },
  { name: "Sam Clark",       email: "sam@gmail.com",     status: "active",       department: "Engineering",  experience: 10, skills: ["C++", "Systems", "Embedded", "Real-time"],          score: 98, appliedDate: new Date("2024-01-03"), tags: ["principal", "systems"] },
  { name: "Tina Rodriguez",  email: "tina@outlook.com",  status: "active",       department: "Product",      experience: 4,  skills: ["UX Design", "Figma", "User Research"],              score: 81, appliedDate: new Date("2024-02-08"), tags: ["design", "ux"] },
];

const jobs = [
  { title: "Senior Backend Engineer",   department: "Engineering",  level: "Senior",    salary: { min: 140000, max: 180000 }, requiredSkills: ["Python", "Java", "Go"], openings: 3, remote: true },
  { title: "Frontend Engineer",         department: "Engineering",  level: "Mid",       salary: { min: 110000, max: 140000 }, requiredSkills: ["JavaScript", "React", "TypeScript"], openings: 2, remote: true },
  { title: "ML Engineer",              department: "Data Science", level: "Senior",    salary: { min: 150000, max: 200000 }, requiredSkills: ["Python", "Machine Learning", "TensorFlow"], openings: 2, remote: false },
  { title: "DevOps Engineer",          department: "DevOps",       level: "Mid",       salary: { min: 120000, max: 155000 }, requiredSkills: ["Docker", "Kubernetes", "AWS"], openings: 1, remote: true },
  { title: "Product Manager",          department: "Product",      level: "Senior",    salary: { min: 130000, max: 165000 }, requiredSkills: ["Product Management", "Agile"], openings: 1, remote: false },
  { title: "Security Engineer",        department: "Security",     level: "Senior",    salary: { min: 145000, max: 185000 }, requiredSkills: ["Cybersecurity", "Penetration Testing"], openings: 1, remote: true },
  { title: "Principal Engineer",       department: "Engineering",  level: "Principal", salary: { min: 180000, max: 240000 }, requiredSkills: ["Systems Programming", "Go", "Rust"], openings: 1, remote: true },
  { title: "Data Engineer",            department: "Data Science", level: "Mid",       salary: { min: 115000, max: 145000 }, requiredSkills: ["Python", "Spark", "SQL"], openings: 2, remote: true },
];

const interviews = [
  { candidateName: "Alice Johnson",   round: 1, type: "Technical",   interviewer: "Sarah Chen",   score: 92, passed: true,  feedback: "Excellent ML knowledge", date: new Date("2024-01-22") },
  { candidateName: "Alice Johnson",   round: 2, type: "System Design",interviewer: "Mark Torres",  score: 89, passed: true,  feedback: "Strong architecture skills", date: new Date("2024-01-29") },
  { candidateName: "Bob Smith",       round: 1, type: "Technical",   interviewer: "Mark Torres",  score: 78, passed: true,  feedback: "Good React, weak Node.js", date: new Date("2024-02-17") },
  { candidateName: "Carol Williams",  round: 1, type: "Technical",   interviewer: "Lisa Park",    score: 95, passed: true,  feedback: "Outstanding researcher", date: new Date("2024-01-27") },
  { candidateName: "Carol Williams",  round: 2, type: "Case Study",  interviewer: "Lisa Park",    score: 93, passed: true,  feedback: "Superb analytical thinking", date: new Date("2024-02-03") },
  { candidateName: "David Brown",     round: 1, type: "HR Screen",   interviewer: "HR Team",      score: 55, passed: false, feedback: "Not enough technical depth", date: new Date("2024-03-10") },
  { candidateName: "Eva Davis",       round: 1, type: "Technical",   interviewer: "Sarah Chen",   score: 88, passed: true,  feedback: "Strong Java and system design", date: new Date("2024-01-15") },
  { candidateName: "Eva Davis",       round: 2, type: "Technical",   interviewer: "Mark Torres",  score: 91, passed: true,  feedback: "Passed coding challenge", date: new Date("2024-01-22") },
  { candidateName: "Frank Miller",    round: 1, type: "Technical",   interviewer: "James Wright", score: 83, passed: true,  feedback: "Solid cloud knowledge", date: new Date("2024-03-06") },
  { candidateName: "Grace Wilson",    round: 1, type: "Technical",   interviewer: "Lisa Park",    score: 96, passed: true,  feedback: "Deep ML expertise", date: new Date("2024-02-01") },
  { candidateName: "Henry Moore",     round: 1, type: "Technical",   interviewer: "Sarah Chen",   score: 99, passed: true,  feedback: "Exceptional — immediate offer", date: new Date("2024-02-08") },
  { candidateName: "Quinn Martinez",  round: 1, type: "Technical",   interviewer: "James Wright", score: 94, passed: true,  feedback: "CISSP level knowledge", date: new Date("2024-01-12") },
  { candidateName: "Sam Clark",       round: 1, type: "Technical",   interviewer: "Sarah Chen",   score: 98, passed: true,  feedback: "Principal-level systems expertise", date: new Date("2024-01-10") },
];

export async function POST() {
  try {
    const db = await getDb();

    // Drop and recreate collections
    await db.collection("candidates").drop().catch(() => {});
    await db.collection("jobs").drop().catch(() => {});
    await db.collection("interviews").drop().catch(() => {});

    await db.collection("candidates").insertMany(candidates);
    await db.collection("jobs").insertMany(jobs);
    await db.collection("interviews").insertMany(interviews);

    // Create useful indexes
    await db.collection("candidates").createIndex({ status: 1 });
    await db.collection("candidates").createIndex({ department: 1 });
    await db.collection("candidates").createIndex({ skills: 1 });
    await db.collection("candidates").createIndex({ score: -1 });
    await db.collection("interviews").createIndex({ candidateName: 1 });

    return NextResponse.json({
      success: true,
      collections: {
        candidates: candidates.length,
        jobs: jobs.length,
        interviews: interviews.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message });
  }
}
