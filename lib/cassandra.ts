import { Client } from "cassandra-driver";
import path from "path";
import fs from "fs";
import os from "os";

async function downloadBundle(url: string): Promise<string> {
  const tmpPath = path.join(os.tmpdir(), "secure-connect.zip");
  if (fs.existsSync(tmpPath)) return tmpPath;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download Cassandra bundle: ${res.status}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(tmpPath, Buffer.from(buffer));
  return tmpPath;
}

let clientInstance: Client | null = null;

export async function getCassandraClient(): Promise<Client> {
  if (clientInstance) return clientInstance;

  let bundlePath: string;

  if (process.env.CASSANDRA_BUNDLE_URL) {
    // Production / local with URL: download bundle from Supabase Storage
    bundlePath = await downloadBundle(process.env.CASSANDRA_BUNDLE_URL);
  } else {
    // Local dev fallback: use local zip file
    bundlePath = path.join(process.cwd(), "secure-connect-polygot-db.zip");
  }

  clientInstance = new Client({
    cloud: { secureConnectBundle: bundlePath },
    credentials: {
      username: process.env.CASSANDRA_USERNAME!,
      password: process.env.CASSANDRA_PASSWORD!,
    },
    keyspace: process.env.CASSANDRA_KEYSPACE ?? "candidate_system",
  });

  await clientInstance.connect();
  return clientInstance;
}


