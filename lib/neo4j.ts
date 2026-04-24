import neo4j, { Driver, Session } from "neo4j-driver";

let driver: Driver | null = null;
let lastUri = "";

export function getDriver(): Driver {
  const uri = process.env.NEO4J_URI!;

  // Reset driver if URI changed (e.g. env reload)
  if (driver && lastUri !== uri) {
    driver.close();
    driver = null;
  }

  if (!driver) {
    // AuraDB URIs start with neo4j+s:// — ensure we never strip the +s
    driver = neo4j.driver(
      uri,
      neo4j.auth.basic(
        process.env.NEO4J_USERNAME ?? "neo4j",
        process.env.NEO4J_PASSWORD!
      ),
      {
        maxConnectionLifetime: 3 * 60 * 60 * 1000,
        maxConnectionPoolSize: 10,
        connectionAcquisitionTimeout: 15000,
        disableLosslessIntegers: true,
      }
    );
    lastUri = uri;
  }
  return driver;
}

export interface Neo4jResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

// Convert Neo4j native types to plain JS values
function serializeValue(val: any): any {
  if (val === null || val === undefined) return null;
  // With disableLosslessIntegers, numbers come back as JS numbers already
  if (typeof val === "number" || typeof val === "boolean" || typeof val === "string") return val;
  // Legacy integer check just in case
  if (neo4j.isInt && neo4j.isInt(val)) return (val as any).toNumber();
  if (Array.isArray(val)) return val.map(serializeValue);
  if (typeof val === "object") {
    const name = val.constructor?.name;
    if (name === "Node") {
      return { _type: "Node", _labels: val.labels, ...serializeProps(val.properties) };
    }
    if (name === "Relationship") {
      return { _type: val.type, _from: val.startNodeElementId, _to: val.endNodeElementId, ...serializeProps(val.properties) };
    }
    if (name === "Path") {
      return `Path(${val.segments.length} segments)`;
    }
    return serializeProps(val);
  }
  return String(val);
}

function serializeProps(props: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(props)) {
    out[k] = serializeValue(v);
  }
  return out;
}

export async function executeNeo4jQuery(cypher: string): Promise<Neo4jResult> {
  const start = Date.now();
  const session: Session = getDriver().session({ database: process.env.NEO4J_DATABASE ?? "neo4j" });

  try {
    const result = await session.run(cypher);

    const columns: string[] = result.records.length > 0
      ? Array.from(result.records[0].keys as string[])
      : (result as any).keys
        ? Array.from((result as any).keys as string[])
        : [];
    const rows = result.records.map((record) => {
      const row: Record<string, any> = {};
      for (const key of columns) {
        const val = record.get(key);
        const serialized = serializeValue(val);
        // Flatten Node objects into the row directly if it's the only column
        if (
          columns.length === 1 &&
          serialized &&
          typeof serialized === "object" &&
          serialized._type === "Node"
        ) {
          const { _type, _labels, ...rest } = serialized;
          row["_labels"] = Array.isArray(_labels) ? _labels.join(", ") : String(_labels ?? "");
          Object.assign(row, rest);
        } else if (serialized && typeof serialized === "object" && !Array.isArray(serialized)) {
          // Flatten nested objects
          for (const [k, v] of Object.entries(serialized)) {
            row[k === "_type" ? "relationship" : k] = typeof v === "object" ? JSON.stringify(v) : v;
          }
        } else {
          row[key] = Array.isArray(serialized) ? JSON.stringify(serialized) : serialized;
        }
      }
      return row;
    });

    // Derive final columns from rows — force plain JS array
    const colSet = new Set<string>();
    rows.forEach((r) => Object.keys(r).forEach((k) => colSet.add(k)));
    const finalColumns: string[] = colSet.size > 0 ? Array.from(colSet) : Array.from(columns);

    return {
      columns: finalColumns,
      rows,
      rowCount: rows.length,
      executionTime: Date.now() - start,
    };
  } catch (err: any) {
    return {
      columns: [], rows: [], rowCount: 0,
      executionTime: Date.now() - start,
      error: err?.message ?? "Neo4j query failed",
    };
  } finally {
    await session.close();
  }
}
