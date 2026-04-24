"use client";

import { useState, useCallback, useEffect } from "react";
import { queryCategories, allQueries } from "@/data/queries";
import { mysqlQueryCategories, allMySQLQueries } from "@/data/mysql-queries";
import { cassandraQueryCategories, allCassandraQueries } from "@/data/cassandra-queries";
import { elasticsearchQueryCategories, allElasticsearchQueries } from "@/data/elasticsearch-queries";
import { redisQueryCategories, allRedisQueries } from "@/data/redis-queries";
import { neo4jQueryCategories, allNeo4jQueries } from "@/data/neo4j-queries";
import { influxQueryCategories, allInfluxQueries } from "@/data/influxdb-queries";
import { mongoQueryCategories, allMongoQueries } from "@/data/mongodb-queries";

interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

type DB = "postgresql" | "mysql" | "cassandra" | "elasticsearch" | "redis" | "neo4j" | "influxdb" | "mongodb";

// Each DB uses a different query field
const getQueryText = (q: any) => {
  if (q.cql)       return q.cql;
  if (q.esQuery)   return q.esQuery;
  if (q.command)   return q.command;
  if (q.cypher)    return q.cypher;
  if (q.flux)      return q.flux;
  if (q.operation) return JSON.stringify(q.operation, null, 2);
  return q.sql ?? "";
};
const getApiRoute = (q: any, db: DB) => {
  if (db === "cassandra")     return q.apiPath ?? "/api/cassandra/query";
  if (db === "elasticsearch") return q.apiPath ?? "/api/elasticsearch/query";
  if (db === "redis")         return q.apiPath ?? "/api/redis/query";
  if (db === "neo4j")         return q.apiPath ?? "/api/neo4j/query";
  if (db === "influxdb")      return q.apiPath ?? "/api/influxdb/query";
  if (db === "mongodb")       return q.apiPath ?? "/api/mongodb/query";
  return db === "mysql" ? "/api/mysql" : "/api/query";
};

const DB_CONFIG = {
  postgresql: {
    label: "PostgreSQL",
    color: "#336791",
    accent: "#4f94d4",
    icon: "🐘",
    categories: queryCategories,
    allQueries: allQueries,
    hint: "SELECT and WITH allowed",
  },
  mysql: {
    label: "MySQL",
    color: "#e48e00",
    accent: "#f5a623",
    icon: "🐬",
    categories: mysqlQueryCategories,
    allQueries: allMySQLQueries,
    hint: "SELECT, SHOW, DESCRIBE, EXPLAIN allowed",
  },
  cassandra: {
    label: "Cassandra",
    color: "#1287a8",
    accent: "#22b5d4",
    icon: "🪐",
    categories: cassandraQueryCategories,
    allQueries: allCassandraQueries,
    hint: "CQL SELECT queries — parameters auto-filled with defaults",
  },
  elasticsearch: {
    label: "Elasticsearch",
    color: "#f04e98",
    accent: "#ff6eb4",
    icon: "🔎",
    categories: elasticsearchQueryCategories,
    allQueries: allElasticsearchQueries,
    hint: "JSON DSL query body — edit the JSON and run",
  },
  redis: {
    label: "Redis",
    color: "#d63b22",
    accent: "#ff6b52",
    icon: "⚡",
    categories: redisQueryCategories,
    allQueries: allRedisQueries,
    hint: "Redis commands — e.g. GET key · HGETALL key · KEYS *",
  },
  neo4j: {
    label: "Neo4j",
    color: "#018bff",
    accent: "#40a9ff",
    icon: "🕸️",
    categories: neo4jQueryCategories,
    allQueries: allNeo4jQueries,
    hint: "Cypher queries — MATCH (n)-[:REL]->(m) RETURN n",
  },
  influxdb: {
    label: "InfluxDB",
    color: "#22adf6",
    accent: "#67d0ff",
    icon: "📈",
    categories: influxQueryCategories,
    allQueries: allInfluxQueries,
    hint: "Flux queries — from(bucket:) |> range() |> filter() |> ...",
  },
  mongodb: {
    label: "MongoDB",
    color: "#00ed64",
    accent: "#00c853",
    icon: "🍃",
    categories: mongoQueryCategories,
    allQueries: allMongoQueries,
    hint: "MongoDB operations — find, aggregate, $match, $group, $lookup",
  },
};

export default function SQLEditorPage() {
  const [activeDB, setActiveDB] = useState<DB>("postgresql");
  const [sql, setSql] = useState(getQueryText(allQueries[0]));
  const [activeQueryId, setActiveQueryId] = useState(allQueries[0].id);
  const [activeApiPath, setActiveApiPath] = useState("/api/query");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [tables, setTables] = useState<string[]>([]);
  const rowsPerPage = 10;

  const dbConf = DB_CONFIG[activeDB];

  const switchDB = (db: DB) => {
    const conf = DB_CONFIG[db];
    const firstQuery = conf.allQueries[0];
    setActiveDB(db);
    setSql(getQueryText(firstQuery));
    setActiveQueryId(firstQuery.id);
    setActiveApiPath(getApiRoute(firstQuery, db));
    setResult(null);
    setActiveCategory(null);
    setSearchQuery("");
    setTables([]);
  };

  useEffect(() => {
    if (activeDB === "postgresql") {
      fetch("/api/tables").then((r) => r.json()).then((d) => setTables(d.tables || []));
    }
  }, [activeDB]);

  const runQuery = useCallback(async () => {
    if (!sql.trim()) return;
    setLoading(true);
    setPage(0);
    const isCassandra = activeDB === "cassandra";
    const isElasticsearch = activeDB === "elasticsearch";
    try {
      const isRedis = activeDB === "redis";
      const isNeo4j = activeDB === "neo4j";
      const isInflux = activeDB === "influxdb";
      const isMongo = activeDB === "mongodb";
      let reqBody: any;
      if (isElasticsearch) {
        const activeQ = dbConf.allQueries.find((q) => q.id === activeQueryId) as any;
        let parsedBody: any;
        try { parsedBody = JSON.parse(sql); } catch {
          setResult({ columns: [], rows: [], rowCount: 0, executionTime: 0, error: "Invalid JSON — check the query body" });
          setLoading(false); return;
        }
        reqBody = { body: parsedBody, index: activeQ?.index ?? "candidates" };
      } else if (isCassandra) {
        reqBody = { cql: sql };
      } else if (isRedis) {
        reqBody = { command: sql };
      } else if (isNeo4j) {
        reqBody = { cypher: sql };
      } else if (isInflux) {
        reqBody = { flux: sql };
      } else if (isMongo) {
        try { reqBody = { operation: JSON.parse(sql) }; } catch {
          setResult({ columns: [], rows: [], rowCount: 0, executionTime: 0, error: "Invalid JSON — check the operation object" });
          setLoading(false); return;
        }
      } else {
        reqBody = { sql };
      }

      const res = await fetch(activeApiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      // Guarantee columns is always a plain JS array
      setResult({ ...data, columns: Array.from(data.columns ?? []), rows: Array.from(data.rows ?? []) });
    } catch {
      setResult({ columns: [], rows: [], rowCount: 0, executionTime: 0, error: "Network error" });
    } finally {
      setLoading(false);
    }
  }, [sql, activeApiPath, activeDB, activeQueryId, dbConf]);

  const selectQuery = (q: any) => {
    setActiveQueryId(q.id);
    setSql(getQueryText(q));
    setActiveApiPath(getApiRoute(q, activeDB));
    setResult(null);
  };

  const filteredCategories = dbConf.categories.map((cat) => ({
    ...cat,
    queries: cat.queries.filter(
      (q) =>
        !searchQuery ||
        q.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.queries.length > 0);

  const activeQuery = dbConf.allQueries.find((q) => q.id === activeQueryId);
  const pagedRows = result?.rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage) ?? [];
  const totalPages = result ? Math.ceil(result.rows.length / rowsPerPage) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden" }}>

      {/* ── Navbar ── */}
      <nav style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "0 20px", display: "flex", alignItems: "center", gap: 12, height: 52, flexShrink: 0 }}>
        <span style={{ fontSize: 20 }}>🗄️</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginRight: 4 }}>SQL Explorer</span>

        <div style={{ display: "flex", gap: 4 }}>
          {(Object.entries(DB_CONFIG) as [DB, typeof DB_CONFIG[DB]][]).map(([key, conf]) => (
            <button key={key} onClick={() => switchDB(key)}
              style={{
                background: activeDB === key ? conf.color : "#0f172a",
                border: `1px solid ${activeDB === key ? conf.color : "#334155"}`,
                borderRadius: 8, padding: "5px 14px",
                color: activeDB === key ? "white" : "#94a3b8",
                cursor: "pointer", fontSize: 13,
                fontWeight: activeDB === key ? 700 : 400,
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
              }}>
              <span>{conf.icon}</span>{conf.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: "#475569" }}>
          Connected to <span style={{ color: dbConf.accent, fontWeight: 600 }}>{dbConf.label}</span>
        </div>
      </nav>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside style={{ width: 300, background: "#1e293b", display: "flex", flexDirection: "column", borderRight: "1px solid #334155", flexShrink: 0 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #334155" }}>
              <input placeholder="Search queries..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "7px 12px", color: "#e2e8f0", fontSize: 13, boxSizing: "border-box", outline: "none" }} />
            </div>

            {/* Cassandra info banner */}
            {activeDB === "cassandra" && (
              <div style={{ padding: "8px 16px", background: "#0c2233", borderBottom: "1px solid #334155", fontSize: 11, color: "#22b5d4" }}>
                🪐 Parameters like <code style={{ background: "#0f172a", padding: "1px 4px", borderRadius: 3 }}>:department_id</code> are auto-filled with defaults
              </div>
            )}

            {/* Elasticsearch info banner */}
            {activeDB === "elasticsearch" && (
              <div style={{ padding: "8px 16px", background: "#2a0a1e", borderBottom: "1px solid #334155", fontSize: 11, color: "#ff6eb4" }}>
                🔎 Edit the JSON query body directly · Aggregations display as table rows
              </div>
            )}

            {/* Redis info banner */}
            {activeDB === "redis" && (
              <div style={{ padding: "8px 16px", background: "#2a0a00", borderBottom: "1px solid #334155", fontSize: 11, color: "#ff6b52" }}>
                ⚡ Type any Redis command — <code style={{ background: "#0f172a", padding: "1px 4px", borderRadius: 3 }}>GET key</code> · <code style={{ background: "#0f172a", padding: "1px 4px", borderRadius: 3 }}>HGETALL key</code> · <code style={{ background: "#0f172a", padding: "1px 4px", borderRadius: 3 }}>KEYS *</code>
              </div>
            )}

            {/* Neo4j info banner */}
            {activeDB === "neo4j" && (
              <div style={{ padding: "8px 16px", background: "#001a33", borderBottom: "1px solid #334155", fontSize: 11, color: "#40a9ff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>🕸️ Cypher — <code style={{ background: "#0f172a", padding: "1px 4px", borderRadius: 3 }}>MATCH (n)-[:REL]→(m)</code></span>
                <button onClick={async () => {
                  const r = await fetch("/api/neo4j/seed", { method: "POST" });
                  const d = await r.json();
                  alert(d.success ? `✅ Graph seeded! ${d.total} operations completed.` : `⚠️ Seeded with ${d.errors} errors. Check console.`);
                }} style={{ background: "#018bff", border: "none", borderRadius: 4, padding: "3px 8px", color: "white", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>
                  Seed Graph
                </button>
              </div>
            )}

            {/* InfluxDB info banner */}
            {activeDB === "influxdb" && (
              <div style={{ padding: "8px 16px", background: "#001a26", borderBottom: "1px solid #334155", fontSize: 11, color: "#67d0ff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>📈 Flux — <code style={{ background: "#0f172a", padding: "1px 4px", borderRadius: 3 }}>from(bucket:) |&gt; range() |&gt; filter()</code></span>
                <button onClick={async () => {
                  const r = await fetch("/api/influxdb/seed", { method: "POST" });
                  const d = await r.json();
                  alert(d.success ? `✅ Seeded! ${d.pointsWritten} points written across ${d.measurements.length} measurements.` : `❌ Seed failed: ${d.error}`);
                }} style={{ background: "#22adf6", border: "none", borderRadius: 4, padding: "3px 8px", color: "white", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>
                  Seed Data
                </button>
              </div>
            )}

            {/* MongoDB info banner */}
            {activeDB === "mongodb" && (
              <div style={{ padding: "8px 16px", background: "#001a0d", borderBottom: "1px solid #334155", fontSize: 11, color: "#00ed64", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>🍃 MongoDB — edit the JSON operation object and run</span>
                <button onClick={async () => {
                  const r = await fetch("/api/mongodb/seed", { method: "POST" });
                  const d = await r.json();
                  alert(d.success
                    ? `✅ Seeded! candidates: ${d.collections.candidates}, jobs: ${d.collections.jobs}, interviews: ${d.collections.interviews}`
                    : `❌ Seed failed: ${d.error}`);
                }} style={{ background: "#00ed64", border: "none", borderRadius: 4, padding: "3px 8px", color: "#001a0d", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>
                  Seed Data
                </button>
              </div>
            )}

            {activeDB === "postgresql" && tables.length > 0 && (
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #334155" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Tables</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {tables.map((t) => (
                    <span key={t} onClick={() => setSql(`SELECT * FROM ${t} LIMIT 20;`)}
                      style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 4, padding: "2px 8px", fontSize: 11, color: "#94a3b8", cursor: "pointer" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto" }}>
              {filteredCategories.map((cat) => (
                <div key={cat.category}>
                  <div onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
                    style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: activeCategory === cat.category ? "#0f172a" : "transparent", borderBottom: "1px solid #1e293b" }}>
                    <span>{cat.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{cat.category}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{cat.queries.length} queries</div>
                    </div>
                    <span style={{ color: "#475569", fontSize: 12 }}>{activeCategory === cat.category ? "▾" : "▸"}</span>
                  </div>

                  {(activeCategory === cat.category || searchQuery) &&
                    cat.queries.map((q) => (
                      <div key={q.id} onClick={() => selectQuery(q)}
                        style={{
                          padding: "8px 16px 8px 36px", cursor: "pointer",
                          background: activeQueryId === q.id ? dbConf.color + "33" : "transparent",
                          borderLeft: activeQueryId === q.id ? `3px solid ${dbConf.accent}` : "3px solid transparent",
                        }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: activeQueryId === q.id ? "#f1f5f9" : "#cbd5e1" }}>{q.label}</div>
                        <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>
                          <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 4px", borderRadius: 3 }}>{q.concept}</code>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* ── Main ── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "8px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "#334155", border: "none", borderRadius: 6, padding: "6px 10px", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>☰</button>
            <div style={{ flex: 1 }}>
              {activeQuery && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{activeQuery.label}</span>
                  <span style={{ fontSize: 11, background: dbConf.color, color: "white", padding: "2px 8px", borderRadius: 4 }}>{activeQuery.concept}</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>— {activeQuery.description}</span>
                </div>
              )}
            </div>
            <button onClick={() => { setSql(""); setResult(null); setActiveQueryId(""); }}
              style={{ background: "#334155", border: "none", borderRadius: 8, padding: "7px 14px", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>Clear</button>
            <button onClick={runQuery} disabled={loading}
              style={{ background: loading ? "#334155" : dbConf.color, border: "none", borderRadius: 8, padding: "7px 18px", color: "white", cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
              {loading ? "⏳ Running..." : "▶ Run Query"}
            </button>
          </div>

          <div style={{ padding: "14px 20px 0", flexShrink: 0 }}>
            <textarea value={sql} onChange={(e) => setSql(e.target.value)}
              onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); runQuery(); } }}
              spellCheck={false}
              placeholder={activeDB === "cassandra" ? "Write your CQL query here... (Ctrl+Enter to run)" : activeDB === "elasticsearch" ? "Edit the JSON query body... (Ctrl+Enter to run)" : activeDB === "redis" ? "Type a Redis command... e.g. GET key · HGETALL key (Ctrl+Enter to run)" : activeDB === "neo4j" ? "Write your Cypher query... MATCH (n)-[:REL]->(m) RETURN n (Ctrl+Enter to run)" : activeDB === "influxdb" ? "Write your Flux query... from(bucket:) |> range() |> filter() (Ctrl+Enter to run)" : activeDB === "mongodb" ? 'Edit the MongoDB operation JSON... { "op": "find", "collection": "candidates", ... } (Ctrl+Enter to run)' : "Write your SQL query here... (Ctrl+Enter to run)"}
              style={{ width: "100%", height: 170, background: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: 16, color: "#e2e8f0", fontFamily: "'Cascadia Code','Fira Code','Courier New',monospace", fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Ctrl+Enter to run · {dbConf.hint}</div>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "10px 20px 20px" }}>
            {result && (
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10, padding: "8px 12px", background: result.error ? "#450a0a" : "#0f2e14", borderRadius: 8, border: `1px solid ${result.error ? "#7f1d1d" : "#14532d"}` }}>
                {result.error
                  ? <><span style={{ color: "#f87171", fontSize: 13 }}>❌ Error</span><span style={{ color: "#fca5a5", fontSize: 13 }}>{result.error}</span></>
                  : <><span style={{ color: "#4ade80", fontSize: 13 }}>✅ Success</span>
                      <span style={{ color: "#86efac", fontSize: 13 }}>{result.rowCount} row{result.rowCount !== 1 ? "s" : ""} returned</span>
                      <span style={{ color: "#64748b", fontSize: 12 }}>in {result.executionTime}ms</span>
                      {result.rowCount > rowsPerPage && <span style={{ color: "#64748b", fontSize: 12 }}>· Page {page + 1} of {totalPages}</span>}
                    </>
                }
              </div>
            )}

            {result && !result.error && result.rows.length > 0 && (
              <>
                <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #334155" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#0f172a" }}>
                        {result.columns.map((col) => (
                          <th key={col} style={{ padding: "8px 14px", textAlign: "left", color: "#64748b", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: "1px solid #334155" }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#1e293b" : "#172033" }}>
                          {result.columns.map((col) => (
                            <td key={col} style={{ padding: "7px 14px", color: "#cbd5e1", borderBottom: "1px solid #1e293b", whiteSpace: "nowrap", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {row[col] === null ? <span style={{ color: "#475569", fontStyle: "italic" }}>NULL</span> : String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12 }}>
                    <button onClick={() => setPage(0)} disabled={page === 0} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "4px 10px", color: "#94a3b8", cursor: page === 0 ? "not-allowed" : "pointer", fontSize: 12 }}>«</button>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "4px 10px", color: "#94a3b8", cursor: page === 0 ? "not-allowed" : "pointer", fontSize: 12 }}>‹</button>
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      const p = Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
                      return <button key={p} onClick={() => setPage(p)} style={{ background: p === page ? dbConf.color : "#1e293b", border: `1px solid ${p === page ? dbConf.color : "#334155"}`, borderRadius: 6, padding: "4px 10px", color: p === page ? "white" : "#94a3b8", cursor: "pointer", fontSize: 12 }}>{p + 1}</button>;
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "4px 10px", color: "#94a3b8", cursor: page === totalPages - 1 ? "not-allowed" : "pointer", fontSize: 12 }}>›</button>
                    <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "4px 10px", color: "#94a3b8", cursor: page === totalPages - 1 ? "not-allowed" : "pointer", fontSize: 12 }}>»</button>
                  </div>
                )}
              </>
            )}

            {!result && !loading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#475569", gap: 8 }}>
                <span style={{ fontSize: 48 }}>{dbConf.icon}</span>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Select a query or write your own</div>
                <div style={{ fontSize: 13 }}>Connected to {dbConf.label} · Press Ctrl+Enter to run</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
