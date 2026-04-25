import { NextRequest, NextResponse } from "next/server";
import { getQueryHistory, getHistoryStats } from "@/lib/pgvector";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterDb = searchParams.get("db") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const [history, stats] = await Promise.all([
      getQueryHistory(limit, filterDb),
      getHistoryStats(),
    ]);

    return NextResponse.json({ history, stats });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message, history: [], stats: null }, { status: 500 });
  }
}
