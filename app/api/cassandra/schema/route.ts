import { NextRequest, NextResponse } from "next/server";
import { getCassandraClient } from "@/lib/cassandra";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const { cql } = await req.json();

    if (!cql || typeof cql !== "string" || cql.trim().length === 0) {
      return NextResponse.json({ error: "CQL query is required" }, { status: 400 });
    }

    const cleanCQL = cql.trim().replace(/;+$/, "");

    
    const result = await (await getCassandraClient()).execute(cleanCQL, [], { prepare: false });

    const executionTime = Date.now() - start;
    const rows = result.rows.map((r) => {
      const obj: Record<string, any> = {};
      result.columns.forEach((col) => {
        const val = r[col.name];
        if (val && typeof val === "object" && val.constructor?.name === "Long") {
          obj[col.name] = val.toString();
        } else if (val instanceof Map) {
          obj[col.name] = JSON.stringify(Object.fromEntries(val));
        } else if (val instanceof Set) {
          obj[col.name] = [...val].join(", ");
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
      error: err.message || "Cassandra schema error",
    });
  }
}
