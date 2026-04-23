import { NextRequest, NextResponse } from "next/server";
import { cassandra } from "@/lib/cassandra";

// Default values for parameterized queries
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

    // Strip trailing semicolons
    const cleanCQL = cql.trim().replace(/;+$/, "");

    // Extract named parameters like :department_id
    const paramNames = [...cleanCQL.matchAll(/:(\w+)/g)].map((m) => m[1]);
    const paramValues = paramNames.map((name) => DEFAULTS[name] ?? null);

    // Replace :param with ? for cassandra-driver
    const execCQL = cleanCQL.replace(/:(\w+)/g, "?");

    await cassandra.connect();
    const result = await cassandra.execute(execCQL, paramValues, { prepare: paramValues.length > 0 });

    const executionTime = Date.now() - start;
    const rows = result.rows.map((r) => {
      const obj: Record<string, any> = {};
      result.columns.forEach((col) => {
        const val = r[col.name];
        // Convert special Cassandra types to strings for JSON serialization
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

    const columns = result.columns.map((c) => c.name);

    return NextResponse.json({
      columns,
      rows,
      rowCount: rows.length,
      executionTime,
    });
  } catch (err: any) {
    return NextResponse.json({
      columns: [], rows: [], rowCount: 0,
      executionTime: Date.now() - start,
      error: err.message || "Cassandra error",
    });
  }
}
