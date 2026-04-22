-- ============================================================
-- Run this entire file in your Supabase SQL editor ONCE
-- Project Settings → SQL Editor → New Query → paste & run
-- ============================================================

-- 1. Create the execute_sql RPC function
--    This lets Next.js run arbitrary SELECT queries safely
CREATE OR REPLACE FUNCTION execute_sql(query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  normalized TEXT;
BEGIN
  -- Safety check: only allow SELECT and WITH (CTE) statements
  normalized := UPPER(TRIM(query));
  IF NOT (normalized LIKE 'SELECT%' OR normalized LIKE 'WITH%') THEN
    RAISE EXCEPTION 'Only SELECT and WITH queries are permitted';
  END IF;

  -- Execute and return as JSON array
  EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || query || ') t'
  INTO result;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO anon, authenticated, service_role;


-- 2. Verify your candidates table exists (from Dashboard project)
--    If not, create it:
-- CREATE TABLE IF NOT EXISTS candidates (
--   id          SERIAL PRIMARY KEY,
--   first_name  TEXT,
--   last_name   TEXT,
--   email       TEXT UNIQUE,
--   status      TEXT DEFAULT 'Active',
--   phone       TEXT,
--   experience  INTEGER,
--   skills      TEXT,
--   created_at  TIMESTAMP DEFAULT NOW()
-- );

-- 3. Test the function
SELECT execute_sql('SELECT COUNT(*) AS total FROM candidates');
