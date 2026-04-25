import { getCassandraClient } from "@/lib/cassandra";
import { v4 as uuidv4 } from "uuid";

export async function POST() {
  

  const departmentId = uuidv4();
  const candidateId = uuidv4();

  await (await getCassandraClient()).execute(
    `INSERT INTO candidates_by_department 
     (department_id, candidate_id, name, email, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      departmentId,
      candidateId,
      "John Doe",
      "john@example.com",
      new Date(),
    ],
    { prepare: true }
  );

  return Response.json({
    message: "Inserted ✅",
    departmentId, // 🔥 save this
  });
}