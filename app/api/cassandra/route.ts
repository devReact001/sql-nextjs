export const dynamic = 'force-dynamic'

import { getCassandraClient } from "@/lib/cassandra";

export async function GET() {
  try {
    

    return Response.json({
      message: "Connected to Cassandra ✅",
    });
  } catch (error) {
    return Response.json({
      error: String(error),
    });
  }
}