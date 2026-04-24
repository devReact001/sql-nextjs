import { NextRequest, NextResponse } from "next/server";
import { executeFluxQuery } from "@/lib/influxdb";

export async function POST(req: NextRequest) {
  try {
    const { flux } = await req.json();

    if (!flux?.trim()) {
      return NextResponse.json({
        columns: [], rows: [], rowCount: 0, executionTime: 0,
        error: "No Flux query provided",
      });
    }

    const result = await executeFluxQuery(flux.trim());
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({
      columns: [], rows: [], rowCount: 0, executionTime: 0,
      error: err?.message ?? "InfluxDB query failed",
    });
  }
}
