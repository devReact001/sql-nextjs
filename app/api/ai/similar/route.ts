import { NextRequest, NextResponse } from "next/server";
import { findSimilarQueries } from "@/lib/pgvector";

export async function POST(req: NextRequest) {
  try {
    const { queryText, limit = 5, filterDb } = await req.json();
    const results = await findSimilarQueries(queryText, limit, filterDb);
    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message, results: [] }, { status: 500 });
  }
}
