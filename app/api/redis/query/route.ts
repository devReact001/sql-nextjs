import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

// Parse Redis command string into tokens (handles quoted strings)
function parseCommand(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuote) {
      if (ch === quoteChar) {
        inQuote = false;
        tokens.push(current);
        current = "";
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = true;
      quoteChar = ch;
    } else if (ch === " " || ch === "\t") {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

// Convert any Redis response to { columns, rows } table format
function formatResponse(
  command: string,
  args: string[],
  response: any
): { columns: string[]; rows: Record<string, any>[] } {
  const cmd = command.toUpperCase();

  if (response === null || response === undefined) {
    return { columns: ["result"], rows: [{ result: "(nil)" }] };
  }

  // String / scalar
  if (typeof response === "string" || typeof response === "number") {
    return { columns: ["result"], rows: [{ result: String(response) }] };
  }

  // Boolean (SET, EXPIRE, etc.)
  if (typeof response === "boolean") {
    return { columns: ["result"], rows: [{ result: response ? "OK" : "(nil)" }] };
  }

  // Array responses
  if (Array.isArray(response)) {
    // HGETALL returns array of [field, val, field, val, ...]
    if (cmd === "HGETALL" && response.length % 2 === 0) {
      const rows: Record<string, any>[] = [];
      for (let i = 0; i < response.length; i += 2) {
        rows.push({ field: response[i], value: response[i + 1] });
      }
      return { columns: ["field", "value"], rows };
    }

    // SMEMBERS, LRANGE, KEYS, etc. — flat list
    if (response.every((r: any) => typeof r === "string" || typeof r === "number")) {
      return {
        columns: ["index", "value"],
        rows: response.map((v: any, i: number) => ({ index: i, value: String(v) })),
      };
    }

    // Nested arrays (SCAN cursor + array)
    if (response.length === 2 && typeof response[0] === "string" && Array.isArray(response[1])) {
      const [cursor, keys] = response;
      return {
        columns: ["cursor", "key"],
        rows: [
          { cursor, key: `next cursor: ${cursor}` },
          ...keys.map((k: string) => ({ cursor: "", key: k })),
        ],
      };
    }

    // Generic nested
    return {
      columns: ["index", "value"],
      rows: response.map((v: any, i: number) => ({ index: i, value: JSON.stringify(v) })),
    };
  }

  // Object (HGETALL via node-redis returns object directly)
  if (typeof response === "object") {
    return {
      columns: ["field", "value"],
      rows: Object.entries(response).map(([field, value]) => ({
        field,
        value: String(value),
      })),
    };
  }

  return { columns: ["result"], rows: [{ result: JSON.stringify(response) }] };
}

// Commands that are read-only / safe
const ALLOWED_COMMANDS = new Set([
  "GET", "MGET", "GETRANGE", "STRLEN",
  "HGET", "HMGET", "HGETALL", "HKEYS", "HVALS", "HLEN", "HEXISTS",
  "LRANGE", "LLEN", "LINDEX",
  "SMEMBERS", "SCARD", "SISMEMBER", "SMISMEMBER", "SRANDMEMBER",
  "ZRANGE", "ZRANGEBYSCORE", "ZRANGEBYLEX", "ZCARD", "ZSCORE", "ZRANK", "ZCOUNT",
  "KEYS", "SCAN", "TYPE", "TTL", "PTTL", "EXISTS", "OBJECT",
  "INFO", "DBSIZE", "TIME",
  // Write commands for demo purposes
  "SET", "MSET", "SETEX", "PSETEX", "SETNX",
  "HSET", "HMSET", "HSETNX",
  "LPUSH", "RPUSH", "LSET",
  "SADD", "ZADD",
  "INCR", "INCRBY", "DECR", "DECRBY",
  "EXPIRE", "EXPIREAT", "PERSIST",
  "DEL",
]);

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { command: rawCommand } = await req.json();

    if (!rawCommand?.trim()) {
      return NextResponse.json({
        columns: [], rows: [], rowCount: 0, executionTime: 0,
        error: "No command provided",
      });
    }

    // Support multi-line — run first non-empty line
    const firstLine = rawCommand.trim().split("\n").find((l: string) => l.trim()) ?? "";
    const tokens = parseCommand(firstLine.trim());
    if (!tokens.length) {
      return NextResponse.json({
        columns: [], rows: [], rowCount: 0, executionTime: 0,
        error: "Empty command",
      });
    }

    const [command, ...args] = tokens;
    const cmdUpper = command.toUpperCase();

    if (!ALLOWED_COMMANDS.has(cmdUpper)) {
      return NextResponse.json({
        columns: [], rows: [], rowCount: 0, executionTime: 0,
        error: `Command '${cmdUpper}' is not allowed.`,
      });
    }

    const redis = await getRedisClient();

    // Execute via sendCommand for maximum compatibility
    const response = await redis.sendCommand([cmdUpper, ...args]);

    const { columns, rows } = formatResponse(cmdUpper, args, response);
    const executionTime = Date.now() - startTime;

    return NextResponse.json({ columns, rows, rowCount: rows.length, executionTime });
  } catch (err: any) {
    return NextResponse.json({
      columns: [], rows: [], rowCount: 0,
      executionTime: Date.now() - startTime,
      error: err?.message || "Redis command failed",
    });
  }
}
