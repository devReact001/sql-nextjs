export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { getCassandraClient } from "@/lib/cassandra";

const DEFAULTS: Record<string, any> = {
  department_id: "572159e3-6baa-4d09-908b-e351130eb368",
  status: "Active",
  skill: "Python",
  experience: 5,
};

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const { cql } = await req.json();
    if (!cql || typeof cql !== "string" || cql.trim().length === 0) {
      return NextResponse.json({ error: "CQL query is required" }, { status: 400 });
    }

    const cleanCQL = cql.trim().replace(/;+$/, "");
    const paramNames = [...cleanCQL.matchAll(/:(\w+)/g)].map((m) => m[1]);
    const paramValues = paramNames.map((name) => DEFAULTS[name] ?? null);
    const execCQL = cleanCQL.replace(/:(\w+)/g, "?");

    const client = await getCassandraClient();
    const result = await client.execute(execCQL, paramValues, { prepare: paramValues.length > 0 });

    const rows = result.rows.map((r) => {
      const obj: Record<string, any> = {};
      result.columns.forEach((col) => {
        const val = r[col.name];
        if (val && typeof val === "object" && val.constructor?.name === "Long") {
          obj[col.name] = val.toString();
        } else if (val instanceof Map) {
          obj[col.name] = Object.fromEntries(val);
        } else if (val instanceof Set) {
          obj[col.name] = [...val];
        } else {
          obj[col.name] = val;
        }
      });
      return obj;
    });

    return NextResponse.json({
      columns: result.columns.map((c) => c.name),
      rows,
      rowCount: rows.length,
      executionTime: Date.now() - start,
    });
  } catch (err: any) {
    return NextResponse.json({
      columns: [], rows: [], rowCount: 0,
      executionTime: Date.now() - start,
      error: err.message || "Cassandra error",
    });
  }
}
