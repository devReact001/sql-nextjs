import { InfluxDB, QueryApi } from "@influxdata/influxdb-client";

let client: InfluxDB | null = null;
let queryApi: QueryApi | null = null;

function getQueryApi(): QueryApi {
  if (!queryApi) {
    client = new InfluxDB({
      url: process.env.INFLUXDB_URL!,
      token: process.env.INFLUXDB_TOKEN!,
    });
    queryApi = client.getQueryApi(process.env.INFLUXDB_ORG!);
  }
  return queryApi;
}

export interface InfluxResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

export async function executeFluxQuery(flux: string): Promise<InfluxResult> {
  const start = Date.now();

  try {
    const api = getQueryApi();
    const rows: Record<string, any>[] = [];
    const colSet = new Set<string>();

    await new Promise<void>((resolve, reject) => {
      api.queryRows(flux, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          // Remove internal InfluxDB metadata columns
          const clean: Record<string, any> = {};
          for (const [k, v] of Object.entries(obj)) {
            if (!k.startsWith("_start") && !k.startsWith("_stop") && k !== "result" && k !== "table") {
              clean[k] = v;
              colSet.add(k);
            }
          }
          rows.push(clean);
        },
        error(err) {
          reject(err);
        },
        complete() {
          resolve();
        },
      });
    });

    // Preferred column order: _time first, then _field, _value, then tags
    const preferred = ["_time", "_measurement", "_field", "_value"];
    const rest = Array.from(colSet).filter((c) => !preferred.includes(c)).sort();
    const columns = [...preferred.filter((c) => colSet.has(c)), ...rest];

    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTime: Date.now() - start,
    };
  } catch (err: any) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      executionTime: Date.now() - start,
      error: err?.message ?? "InfluxDB query failed",
    };
  }
}
