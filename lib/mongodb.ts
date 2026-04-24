import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;

export async function getDb(): Promise<Db> {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 10000,
    });
    await client.connect();
  }
  return client.db(process.env.MONGODB_DB ?? "sql_explorer");
}

export interface MongoResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

// Serialize MongoDB BSON types to plain JS
function serialize(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") return val;
  if (val instanceof Date) return val.toISOString();
  if (Array.isArray(val)) return val.map(serialize);
  if (typeof val === "object") {
    // ObjectId
    if (val._bsontype === "ObjectId" || val.constructor?.name === "ObjectId") {
      return val.toString();
    }
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = serialize(v);
    }
    return out;
  }
  return String(val);
}

export async function executeMongoOperation(operation: MongoOperation): Promise<MongoResult> {
  const start = Date.now();
  try {
    const db = await getDb();
    const collection = db.collection(operation.collection);
    let docs: any[] = [];

    switch (operation.op) {
      case "find":
        docs = await collection
          .find(operation.filter ?? {}, { projection: operation.projection })
          .sort(operation.sort ?? {})
          .limit(operation.limit ?? 20)
          .skip(operation.skip ?? 0)
          .toArray();
        break;

      case "aggregate":
        docs = await collection.aggregate(operation.pipeline ?? []).toArray();
        break;

      case "countDocuments":
        const count = await collection.countDocuments(operation.filter ?? {});
        docs = [{ count }];
        break;

      case "distinct":
        const values = await collection.distinct(operation.field!, operation.filter ?? {});
        docs = values.map((v: any) => ({ value: serialize(v) }));
        break;

      case "insertMany":
        const insertResult = await collection.insertMany(operation.documents ?? []);
        docs = [{ insertedCount: insertResult.insertedCount, acknowledged: insertResult.acknowledged }];
        break;

      default:
        return { columns: [], rows: [], rowCount: 0, executionTime: 0, error: `Unknown operation: ${operation.op}` };
    }

    const rows = docs.map((doc) => {
      const serialized = serialize(doc);
      // Flatten _id to string at top level
      if (serialized._id) serialized._id = String(serialized._id);
      return serialized;
    });

    const colSet = new Set<string>();
    rows.forEach((r) => Object.keys(r).forEach((k) => colSet.add(k)));
    // Put _id first
    const columns = ["_id", ...Array.from(colSet).filter((c) => c !== "_id")].filter((c) => colSet.has(c) || c === "_id");

    return { columns: Array.from(new Set(columns)), rows, rowCount: rows.length, executionTime: Date.now() - start };
  } catch (err: any) {
    return { columns: [], rows: [], rowCount: 0, executionTime: Date.now() - start, error: err?.message ?? "MongoDB operation failed" };
  }
}

export interface MongoOperation {
  op: "find" | "aggregate" | "countDocuments" | "distinct" | "insertMany";
  collection: string;
  filter?: Record<string, any>;
  projection?: Record<string, any>;
  sort?: Record<string, any>;
  limit?: number;
  skip?: number;
  pipeline?: any[];
  field?: string;
  documents?: any[];
}
