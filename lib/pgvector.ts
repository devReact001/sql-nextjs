import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface QueryRecord {
  id?: number;
  db: string;
  query_text: string;
  query_label?: string;
  concept?: string;
  row_count?: number;
  exec_time?: number;
  had_error?: boolean;
  created_at?: string;
  similarity?: number;
}

// Get embedding from Anthropic API using claude's text embedding
// We use a small Claude call to generate a semantic description for embedding
async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{
        role: "user",
        content: `Respond with ONLY a JSON array of 1536 numbers between -1 and 1 representing a semantic embedding for this database query. No explanation, no markdown, just the raw JSON array.

Query: ${text.slice(0, 500)}`,
      }],
    }),
  });

  const data = await res.json();
  const content = data.content?.[0]?.text ?? "[]";
  try {
    const embedding = JSON.parse(content.trim());
    if (Array.isArray(embedding) && embedding.length === 1536) return embedding;
  } catch {}

  // Fallback: generate deterministic pseudo-embedding from text hash
  return generateFallbackEmbedding(text);
}

// Deterministic fallback embedding (no API needed)
function generateFallbackEmbedding(text: string): number[] {
  const embedding = new Array(1536).fill(0);
  for (let i = 0; i < text.length; i++) {
    embedding[i % 1536] += (text.charCodeAt(i) - 64) / 128;
  }
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)) || 1;
  return embedding.map((v) => v / magnitude);
}

export async function saveQueryToHistory(record: QueryRecord): Promise<void> {
  try {
    const textToEmbed = [
      record.query_label,
      record.concept,
      record.db,
      record.query_text,
    ].filter(Boolean).join(" — ");

    const embedding = await getEmbedding(textToEmbed);

    await supabase.from("query_history").insert({
      db: record.db,
      query_text: record.query_text,
      query_label: record.query_label,
      concept: record.concept,
      row_count: record.row_count ?? 0,
      exec_time: record.exec_time ?? 0,
      had_error: record.had_error ?? false,
      embedding: JSON.stringify(embedding),
    });
  } catch (err) {
    console.error("Failed to save query to history:", err);
  }
}

export async function findSimilarQueries(
  queryText: string,
  limit = 5,
  filterDb?: string
): Promise<QueryRecord[]> {
  try {
    const embedding = await getEmbedding(queryText);
    const { data, error } = await supabase.rpc("match_queries", {
      query_embedding: JSON.stringify(embedding),
      match_count: limit,
      filter_db: filterDb ?? null,
    });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("Similarity search failed:", err);
    return [];
  }
}

export async function getQueryHistory(limit = 50, filterDb?: string): Promise<QueryRecord[]> {
  let query = supabase
    .from("query_history")
    .select("id, db, query_text, query_label, concept, row_count, exec_time, had_error, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filterDb) query = query.eq("db", filterDb);

  const { data } = await query;
  return data ?? [];
}

export async function getHistoryStats(): Promise<{
  total: number;
  byDb: Record<string, number>;
  successRate: number;
  avgExecTime: number;
}> {
  const { data } = await supabase
    .from("query_history")
    .select("db, had_error, exec_time");

  if (!data || data.length === 0) {
    return { total: 0, byDb: {}, successRate: 0, avgExecTime: 0 };
  }

  const byDb: Record<string, number> = {};
  let errors = 0;
  let totalTime = 0;

  for (const row of data) {
    byDb[row.db] = (byDb[row.db] ?? 0) + 1;
    if (row.had_error) errors++;
    totalTime += row.exec_time ?? 0;
  }

  return {
    total: data.length,
    byDb,
    successRate: Math.round(((data.length - errors) / data.length) * 100),
    avgExecTime: Math.round(totalTime / data.length),
  };
}
