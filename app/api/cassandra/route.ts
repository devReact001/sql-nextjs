import { cassandra } from "@/lib/cassandra";

export async function GET() {
  try {
    await cassandra.connect();

    return Response.json({
      message: "Connected to Cassandra ✅",
    });
  } catch (error) {
    return Response.json({
      error: String(error),
    });
  }
}