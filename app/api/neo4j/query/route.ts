import { NextRequest, NextResponse } from "next/server";
import { executeNeo4jQuery } from "@/lib/neo4j";

// Only allow read queries + a few safe write operations for seeding
const FORBIDDEN = ["DROP", "DETACH DELETE", "DELETE", "REMOVE", "MERGE"];

export async function POST(req: NextRequest) {
  try {
    const { cypher } = await req.json();

    if (!cypher?.trim()) {
      return NextResponse.json({
        columns: [], rows: [], rowCount: 0, executionTime: 0,
        error: "No Cypher query provided",
      });
    }

    const upper = cypher.trim().toUpperCase();
    const forbidden = FORBIDDEN.find((f) => upper.includes(f));
    if (forbidden) {
      return NextResponse.json({
        columns: [], rows: [], rowCount: 0, executionTime: 0,
        error: `'${forbidden}' is not allowed in this explorer.`,
      });
    }

    const result = await executeNeo4jQuery(cypher.trim());
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({
      columns: [], rows: [], rowCount: 0, executionTime: 0,
      error: err?.message ?? "Neo4j query failed",
    });
  }
}
