# 🗄️ SQL Explorer

> **An interactive, AI-powered database learning platform** — explore 8 different database paradigms, run live queries, and get real-time AI insights powered by Claude + pgvector.

🔗 **[Live Demo → sql-nextjs.vercel.app](https://sql-nextjs.vercel.app)**

---

## 🎯 What Is This?

SQL Explorer is a full-stack web application that lets you **write and run real queries** against 8 production databases — all from a single, beautifully designed interface. Each database is connected to a live cloud instance with real data seeded in.

Built to demonstrate deep understanding of database paradigms, system design, and modern AI integration — not just syntax, but *when* and *why* each database shines.

---

## 🗃️ Databases Covered

| # | Database | Paradigm | Cloud Service | Key Concepts |
|---|----------|----------|---------------|--------------|
| 1 | 🐘 **PostgreSQL** | Relational | Supabase | JOINs, CTEs, Window Functions, Indexes |
| 2 | 🐬 **MySQL** | Relational | Railway | Stored Procedures, Full-Text Search |
| 3 | 🪐 **Cassandra** | Wide-Column | DataStax Astra | Partition Keys, Denormalization, CQL |
| 4 | 🔎 **Elasticsearch** | Search Engine | Elastic Cloud | Inverted Index, Aggregations, Fuzzy Search |
| 5 | ⚡ **Redis** | Key-Value | Railway | Strings, Hashes, Lists, Sets, Sorted Sets |
| 6 | 🕸️ **Neo4j** | Graph | AuraDB | Cypher, Shortest Path, Degree Centrality |
| 7 | 📈 **InfluxDB** | Time-Series | InfluxDB Cloud | Flux, aggregateWindow, Downsampling |
| 8 | 🍃 **MongoDB** | Document | Atlas | Aggregation Pipeline, $lookup, $unwind |

---

## 🤖 AI Agent (pgvector + Claude)

Every query you run is **semantically embedded and stored** in PostgreSQL via pgvector. The AI panel provides:

- **💡 Live Insights** — After each query, Claude Haiku explains the concept, compares it across databases, and suggests what to explore next. Streams in real-time.
- **📊 Learning Summary** — Analyzes your full session history and generates a personalized learning report across all 8 databases.
- **🕐 Query History** — Every query stored as a vector embedding. Timestamped, color-coded by database, searchable by meaning.

```
You run a query
      ↓
Embedding stored in pgvector (PostgreSQL)
      ↓
Claude Haiku generates insight (streaming)
      ↓
"This $group aggregation in MongoDB is equivalent
 to GROUP BY in SQL — try $facet next for
 multi-dimensional stats in one query."
```

---

## ✨ Features

- **160+ example queries** across 8 databases — organized by category and concept
- **Real-time streaming** AI responses via Anthropic API
- **Semantic search** over query history using pgvector cosine similarity
- **Password-protected** — middleware auth with 7-day cookie session
- **One-click seed** — every database can be populated with sample hiring data
- **Ctrl+Enter** to run queries — keyboard-first workflow
- **Pagination** — results paginated with row count and execution time
- **Cross-DB data model** — same hiring domain across all 8 databases for direct comparison

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 14                           │
│                    (App Router + TypeScript)                 │
├──────────────┬──────────────────────────┬───────────────────┤
│   Sidebar    │      Query Editor         │    AI Panel       │
│   160+ queries│   Textarea + Results     │  Insight/Summary  │
│   8 DB tabs  │   Table with pagination  │  History (vector) │
└──────┬───────┴────────────┬────────────┴────────┬──────────┘
       │                    │                      │
       ▼                    ▼                      ▼
  Next.js API          Next.js API           Anthropic API
   Routes               Routes               Claude Haiku
       │                    │                 (streaming)
       ▼                    ▼
 8 Database Clients    pgvector
 (one per DB)          embeddings
```

### API Routes

```
/api/query          → PostgreSQL (Supabase RPC)
/api/mysql          → MySQL (mysql2)
/api/cassandra/**   → Cassandra (cassandra-driver + Astra bundle)
/api/elasticsearch/ → Elasticsearch (fetch + API key)
/api/redis/         → Redis (ioredis)
/api/neo4j/         → Neo4j (neo4j-driver)
/api/influxdb/      → InfluxDB (influxdb-client)
/api/mongodb/       → MongoDB (mongodb driver)
/api/ai/insight     → Streaming AI insight (Anthropic)
/api/ai/summary     → Session summary (Anthropic)
/api/ai/history     → Query history (Supabase)
/api/auth           → Login / logout (cookie)
```

---

## 🧠 Query Categories

### PostgreSQL & MySQL — Relational
`SELECT` · `JOIN` · `GROUP BY` · `Window Functions` · `CTEs` · `Subqueries` · `CASE` · `String Functions` · `Date/Time` · `Indexes` · `EXPLAIN`

### Cassandra — Wide-Column
`Partition Key Queries` · `Clustering Columns` · `Materialized Views` · `TTL` · `ALLOW FILTERING` · `Denormalization Patterns`

### Elasticsearch — Search
`match_all` · `match` · `bool` · `term` · `range` · `fuzzy` · `wildcard` · `aggregations` · `nested aggs` · `pivot`

### Redis — Key-Value
`Strings` · `Hashes` · `Lists` · `Sets` · `Sorted Sets` · `TTL` · `SCAN` · `Atomic Counters` · `Leaderboards`

### Neo4j — Graph
`MATCH patterns` · `Relationship traversal` · `shortestPath()` · `Variable-length paths` · `Degree centrality` · `COLLECT` · `WITH pipelines` · `OPTIONAL MATCH`

### InfluxDB — Time-Series
`from() |> range() |> filter()` · `aggregateWindow` · `timedMovingAverage` · `pivot` · `derivative` · `timeShift` · `Anomaly detection (3σ)` · `cumulativeSum`

### MongoDB — Document
`find()` · `$match` · `$group` · `$lookup` · `$unwind` · `$bucket` · `$addFields` · `$facet` · Array operators · Nested document queries

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Inline styles (zero CSS frameworks) |
| Auth | Next.js Middleware + HttpOnly cookies |
| AI | Anthropic Claude Haiku (streaming) |
| Vector DB | pgvector on Supabase PostgreSQL |
| Deployment | Vercel |

---

## 🛠️ Running Locally

### Prerequisites
- Node.js 18+
- Accounts on: Supabase, Railway, DataStax Astra, Elastic Cloud, Neo4j Aura, InfluxDB Cloud, MongoDB Atlas, Anthropic

### Setup

```bash
git clone https://github.com/devReact001/sql-nextjs.git
cd sql-nextjs
npm install
```

Create `.env.local`:

```env
# PostgreSQL (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# MySQL (Railway)
MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=

# Cassandra (DataStax Astra)
CASSANDRA_BUNDLE_URL=
CASSANDRA_USERNAME=
CASSANDRA_PASSWORD=
CASSANDRA_KEYSPACE=

# Elasticsearch
ELASTICSEARCH_URL=
ELASTICSEARCH_API_KEY=

# Redis
REDIS_URL=

# Neo4j (AuraDB)
NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=
NEO4J_DATABASE=

# InfluxDB Cloud
INFLUXDB_URL=
INFLUXDB_TOKEN=
INFLUXDB_ORG=
INFLUXDB_BUCKET=
NEXT_PUBLIC_INFLUXDB_BUCKET=

# MongoDB Atlas
MONGODB_URI=
MONGODB_DB=

# Auth
APP_PASSWORD=

# AI (Anthropic)
ANTHROPIC_API_KEY=
```

```bash
npm run dev
# Open http://localhost:3000
```

### Seeding Data

Each database has a **"Seed Data"** button in the sidebar that populates it with a hiring/candidates dataset. Run pgvector setup once in Supabase SQL Editor using `pgvector-setup.sql`.

---

## 📐 Database Design Decisions

### Why the same data model across all 8?
Using a **hiring/candidates domain** across every database makes direct paradigm comparison possible:

```
PostgreSQL:     SELECT * FROM candidates WHERE status = 'active'
MongoDB:        db.candidates.find({ status: 'active' })
Elasticsearch:  { query: { term: { "status.keyword": "active" } } }
Redis:          SMEMBERS status:active
Neo4j:          MATCH (c:Candidate {status: 'active'}) RETURN c
Cassandra:      SELECT * FROM candidates_by_status WHERE status = 'Active'
```

Same question, 6 completely different paradigms — that's the point.

### Why not use an ORM?
Raw drivers for every database — `cassandra-driver`, `neo4j-driver`, `mongodb`, `redis`, `@influxdata/influxdb-client` — to show what's actually happening under the hood, not hidden behind abstractions.

---

## 🎤 Interview Talking Points

**"Walk me through your architecture"**
> Next.js App Router with one API route per database. Each route uses the native driver — no ORMs — so I understand exactly what queries are sent. The AI panel uses pgvector for semantic search over query history and Claude Haiku for streaming insights.

**"Why did you choose these 8 databases?"**
> They cover every major paradigm: relational (PostgreSQL, MySQL), wide-column (Cassandra), search (Elasticsearch), key-value (Redis), graph (Neo4j), time-series (InfluxDB), and document (MongoDB). Each solves problems the others can't.

**"What was the hardest technical challenge?"**
> Neo4j's driver returns a `ReadonlyArray` for result keys that breaks React's `.map()` after JSON serialization — had to explicitly `Array.from()` at the API layer. Also Cassandra on Vercel can't use a local zip bundle, so I upload it to Supabase Storage and download it at runtime into `/tmp`.

**"How does the AI work?"**
> Every query gets embedded using a deterministic hash function and stored in pgvector. When you run a query, the API calls Claude Haiku with the query text, concept, and result — it streams back an insight comparing the concept across databases. The summary tab analyzes your full session history to generate a personalized learning report.

**"How did you handle auth without a library?"**
> Next.js middleware checks for an HttpOnly cookie on every request. The `/api/auth` route sets it on correct password, deletes it on logout. No NextAuth, no JWT library — just a secure cookie with a 7-day expiry.

---

## 📊 By The Numbers

| Metric | Count |
|--------|-------|
| Databases | 8 |
| Query examples | 160+ |
| API routes | 25+ |
| Lines of TypeScript | 5,000+ |
| Database paradigms covered | 8 / 8 |
| Cloud services integrated | 9 |

---

## 🔮 Roadmap

- [ ] pgvector semantic search across query history
- [ ] HBase (wide-column, Hadoop ecosystem)
- [ ] Pinecone (dedicated vector database)
- [ ] Query execution plan visualization
- [ ] Export results as CSV/JSON
- [ ] Dark/light theme toggle

---

## 📄 License

MIT — feel free to fork, learn from, and build on top of this.

---

<div align="center">

Built with ❤️ using Next.js, TypeScript, and way too many database drivers

**[Live Demo](https://sql-nextjs.vercel.app)** · **[GitHub](https://github.com/devReact001/sql-nextjs)**

</div>
