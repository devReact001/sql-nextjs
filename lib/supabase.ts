import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role key (full access, never expose to client)
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

// Execute raw SQL via Supabase's rpc or postgres connection
export async function executeSQL(sql: string): Promise<QueryResult> {
  const start = Date.now();

  try {
    const normalized = sql.trim().toUpperCase();
    if (!normalized.startsWith("SELECT") && !normalized.startsWith("WITH")) {
      return {
        columns: [], rows: [], rowCount: 0, executionTime: 0,
        error: "Only SELECT and WITH (CTE) queries are allowed.",
      };
    }

    // ✅ Strip trailing semicolon — PostgreSQL RPC doesn't allow it
    const cleanSQL = sql.trim().replace(/;+$/, "");

    const { data, error } = await supabase.rpc("execute_sql", { query: cleanSQL });

    const executionTime = Date.now() - start;

    if (error) {
      return { columns: [], rows: [], rowCount: 0, executionTime, error: error.message };
    }

    const rows = Array.isArray(data) ? data : [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return { columns, rows, rowCount: rows.length, executionTime };
  } catch (err: any) {
    return { columns: [], rows: [], rowCount: 0, executionTime: Date.now() - start, error: err.message };
  }
}
