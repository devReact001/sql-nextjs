import { NextRequest, NextResponse } from "next/server";
import { executeMongoOperation, MongoOperation } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { operation } = body as { operation: MongoOperation };

    if (!operation?.op || !operation?.collection) {
      return NextResponse.json({
        columns: [], rows: [], rowCount: 0, executionTime: 0,
        error: "Invalid operation — must include op and collection",
      });
    }

    // Block write operations except insertMany (used by seed only via seed route)
    const readOnly = ["find", "aggregate", "countDocuments", "distinct"];
    if (!readOnly.includes(operation.op)) {
      return NextResponse.json({
        columns: [], rows: [], rowCount: 0, executionTime: 0,
        error: `'${operation.op}' is not allowed in the explorer. Only read operations are permitted.`,
      });
    }

    const result = await executeMongoOperation(operation);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({
      columns: [], rows: [], rowCount: 0, executionTime: 0,
      error: err?.message ?? "MongoDB query failed",
    });
  }
}
