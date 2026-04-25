import { getCassandraClient } from "@/lib/cassandra";

export async function GET() {
  

  const departmentId = "572159e3-6baa-4d09-908b-e351130eb368";

  const result = await (await getCassandraClient()).execute(
    `SELECT * FROM candidates_by_department 
     WHERE department_id = ?`,
    [departmentId],
    { prepare: true }
  );

  return Response.json(result.rows);
}