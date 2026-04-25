-- ============================================================
-- Run this in Supabase SQL Editor ONCE to set up pgvector
-- Project Settings → SQL Editor → New Query → paste & run
-- ============================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create query history table with embeddings
CREATE TABLE IF NOT EXISTS query_history (
  id          BIGSERIAL PRIMARY KEY,
  db          TEXT NOT NULL,
  query_text  TEXT NOT NULL,
  query_label TEXT,
  concept     TEXT,
  row_count   INTEGER DEFAULT 0,
  exec_time   INTEGER DEFAULT 0,
  had_error   BOOLEAN DEFAULT FALSE,
  embedding   vector(1536),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS query_history_embedding_idx
  ON query_history
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- 4. Index for filtering by db
CREATE INDEX IF NOT EXISTS query_history_db_idx ON query_history (db);
CREATE INDEX IF NOT EXISTS query_history_created_idx ON query_history (created_at DESC);

-- 5. RPC function for semantic similarity search
CREATE OR REPLACE FUNCTION match_queries(
  query_embedding vector(1536),
  match_count     INT DEFAULT 5,
  filter_db       TEXT DEFAULT NULL
)
RETURNS TABLE (
  id          BIGINT,
  db          TEXT,
  query_text  TEXT,
  query_label TEXT,
  concept     TEXT,
  row_count   INTEGER,
  exec_time   INTEGER,
  had_error   BOOLEAN,
  created_at  TIMESTAMPTZ,
  similarity  FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    qh.id, qh.db, qh.query_text, qh.query_label,
    qh.concept, qh.row_count, qh.exec_time, qh.had_error,
    qh.created_at,
    1 - (qh.embedding <=> query_embedding) AS similarity
  FROM query_history qh
  WHERE
    qh.embedding IS NOT NULL
    AND (filter_db IS NULL OR qh.db = filter_db)
  ORDER BY qh.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
