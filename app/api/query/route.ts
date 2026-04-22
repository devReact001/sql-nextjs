import { NextRequest, NextResponse } from "next/server";
import { executeSQL } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { sql } = await req.json();

    if (!sql || typeof sql !== "string") {
      return NextResponse.json(
        { error: "SQL query is required" },
        { status: 400 }
      );
    }

    if (sql.trim().length === 0) {
      return NextResponse.json(
        { error: "SQL query cannot be empty" },
        { status: 400 }
      );
    }

    const result = await executeSQL(sql);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
