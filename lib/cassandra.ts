import { Client } from "cassandra-driver";
import path from "path";

const bundlePath = path.join(process.cwd(), "secure-connect-polygot-db.zip");

export const cassandra = new Client({
  cloud: {
    secureConnectBundle: bundlePath,
  },
  credentials: {
    username: process.env.CASSANDRA_USERNAME!,
    password: process.env.CASSANDRA_PASSWORD!,
  },
  keyspace: "candidate_system",
});