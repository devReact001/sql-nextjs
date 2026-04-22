import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase.rpc("execute_sql", {
      query: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `,
    });

    if (error) throw error;

    const tables = (data || []).map((r: any) => r.table_name);
    return NextResponse.json({ tables });
  } catch (err: any) {
    return NextResponse.json({ tables: [], error: err.message });
  }
}
