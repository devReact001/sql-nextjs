import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: "shinkansen.proxy.rlwy.net",
      port: parseInt(process.env.MYSQL_PORT || "3306"),
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 5,
    });
  }
  return pool;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

export async function executeMySQLQuery(sql: string): Promise<QueryResult> {
  const start = Date.now();

  try {
    const normalized = sql.trim().toUpperCase();
    if (
      !normalized.startsWith("SELECT") &&
      !normalized.startsWith("WITH") &&
      !normalized.startsWith("SHOW") &&
      !normalized.startsWith("DESCRIBE") &&
      !normalized.startsWith("EXPLAIN")
    ) {
      return {
        columns: [], rows: [], rowCount: 0, executionTime: 0,
        error: "Only SELECT, SHOW, DESCRIBE and EXPLAIN queries are allowed.",
      };
    }

    const db = getPool();
    const [rows, fields] = await db.execute(sql);
    const executionTime = Date.now() - start;

    const rowsArray = Array.isArray(rows) ? rows as Record<string, any>[] : [];
    const columns = (fields as mysql.FieldPacket[]).map((f) => f.name);

    return { columns, rows: rowsArray, rowCount: rowsArray.length, executionTime };
  } catch (err: any) {
    return {
      columns: [], rows: [], rowCount: 0,
      executionTime: Date.now() - start,
      error: err.message,
    };
  }
}
