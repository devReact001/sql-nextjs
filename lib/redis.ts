import { createClient, RedisClientType } from "redis";

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        tls: process.env.REDIS_URL?.startsWith("rediss://"),
        rejectUnauthorized: false,
      },
    }) as RedisClientType;

    client.on("error", (err) => {
      console.error("Redis client error:", err);
    });

    await client.connect();
  }

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

export interface RedisResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number;
  error?: string;
}
