export interface QueryCategory {
  category: string;
  icon: string;
  description: string;
  queries: QueryItem[];
}

export interface QueryItem {
  id: string;
  label: string;
  flux: string;
  description: string;
  concept: string;
  apiPath: string;
}

const BUCKET = process.env.NEXT_PUBLIC_INFLUXDB_BUCKET ?? "hiring";

export const influxQueryCategories: QueryCategory[] = [
  {
    category: "Basic Queries",
    icon: "📡",
    description: "Fundamental Flux query structure — from, range, filter",
    queries: [
      {
        id: "influx_raw_scores",
        label: "Raw Interview Scores",
        concept: "from |> range |> filter",
        description: "Every Flux query needs from(), range(), and filter() — the three mandatory stages",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "interview_scores")
  |> filter(fn: (r) => r._field == "score")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 20)`,
      },
      {
        id: "influx_pipeline_events",
        label: "Pipeline Events",
        concept: "from |> range |> filter",
        description: "Query the hiring pipeline funnel — how many candidates are at each stage",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "pipeline_events")
  |> filter(fn: (r) => r._field == "count")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 30)`,
      },
      {
        id: "influx_system_metrics",
        label: "System Metrics",
        concept: "multiple fields",
        description: "CPU, memory and disk metrics — one measurement, multiple fields",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "system_metrics")
  |> filter(fn: (r) => r._field == "cpu_percent" or r._field == "memory_percent")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 20)`,
      },
      {
        id: "influx_last_value",
        label: "Latest Value per Series",
        concept: "last()",
        description: "Get only the most recent data point — like SELECT ... ORDER BY time DESC LIMIT 1",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "system_metrics")
  |> last()`,
      },
    ],
  },
  {
    category: "Time Windowing",
    icon: "🪟",
    description: "aggregateWindow — InfluxDB's most powerful feature, no SQL equivalent",
    queries: [
      {
        id: "influx_daily_avg",
        label: "Daily Average Score",
        concept: "aggregateWindow mean",
        description: "Bucket data into 1-day windows and average — impossible to express elegantly in SQL",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "interview_scores")
  |> filter(fn: (r) => r._field == "score")
  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
  |> sort(columns: ["_time"])`,
      },
      {
        id: "influx_hourly_latency",
        label: "Hourly Latency (p95)",
        concept: "aggregateWindow mean",
        description: "Downsample response times into hourly buckets — standard time-series pattern",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "response_time_ms")
  |> filter(fn: (r) => r._field == "p95")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> sort(columns: ["_time"])`,
      },
      {
        id: "influx_weekly_pipeline",
        label: "Weekly Pipeline Totals",
        concept: "aggregateWindow sum",
        description: "Sum pipeline events into weekly buckets — roll up granular data into larger windows",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "pipeline_events")
  |> filter(fn: (r) => r._field == "count")
  |> aggregateWindow(every: 1w, fn: sum, createEmpty: false)
  |> sort(columns: ["_time"])`,
      },
      {
        id: "influx_moving_avg",
        label: "7-Day Moving Average",
        concept: "timedMovingAverage",
        description: "Smooth noisy data with a rolling average — used in dashboards and anomaly detection",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "interview_scores")
  |> filter(fn: (r) => r._field == "score")
  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
  |> timedMovingAverage(every: 1d, period: 7d)`,
      },
    ],
  },
  {
    category: "Filtering & Tags",
    icon: "🏷️",
    description: "Tags are indexed metadata — the key to fast time-series queries",
    queries: [
      {
        id: "influx_by_candidate",
        label: "Filter by Tag (Candidate)",
        concept: "filter on tag",
        description: "Tags are indexed like columns in SQL — filter by candidate_id for fast lookup",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "interview_scores")
  |> filter(fn: (r) => r.candidate_id == "1")
  |> filter(fn: (r) => r._field == "score")
  |> sort(columns: ["_time"])`,
      },
      {
        id: "influx_by_department",
        label: "Filter by Department Tag",
        concept: "filter on tag",
        description: "Multi-tag filtering — narrow results by department across all candidates",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "interview_scores")
  |> filter(fn: (r) => r.department == "Engineering")
  |> filter(fn: (r) => r._field == "score")
  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
  |> sort(columns: ["_time"])`,
      },
      {
        id: "influx_email_funnel",
        label: "Email Campaign Funnel",
        concept: "filter by tag value",
        description: "Filter email events by type to see the send → open → click funnel over time",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "email_events")
  |> filter(fn: (r) => r.event_type == "opened")
  |> filter(fn: (r) => r._field == "count")
  |> aggregateWindow(every: 1w, fn: sum, createEmpty: false)`,
      },
      {
        id: "influx_stage_filter",
        label: "Single Pipeline Stage",
        concept: "tag equality filter",
        description: "Track one stage of the hiring funnel — how many candidates reached 'technical'",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "pipeline_events")
  |> filter(fn: (r) => r.stage == "technical")
  |> filter(fn: (r) => r._field == "count")
  |> sort(columns: ["_time"])`,
      },
    ],
  },
  {
    category: "Aggregations",
    icon: "📊",
    description: "mean, sum, min, max, count — grouped by time or tag",
    queries: [
      {
        id: "influx_mean_by_dept",
        label: "Mean Score by Department",
        concept: "group + mean",
        description: "Group by a tag then aggregate — like GROUP BY department in SQL",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "interview_scores")
  |> filter(fn: (r) => r._field == "score")
  |> group(columns: ["department"])
  |> mean()
  |> group()`,
      },
      {
        id: "influx_max_score",
        label: "Max Score per Candidate",
        concept: "group + max",
        description: "Find each candidate's best score — like SELECT MAX(score) GROUP BY candidate",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "interview_scores")
  |> filter(fn: (r) => r._field == "score")
  |> group(columns: ["candidate_name"])
  |> max()
  |> group()`,
      },
      {
        id: "influx_total_pipeline",
        label: "Total Applications by Stage",
        concept: "group + sum",
        description: "Sum all events per pipeline stage over the full period — the hiring funnel",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "pipeline_events")
  |> filter(fn: (r) => r._field == "count")
  |> group(columns: ["stage"])
  |> sum()
  |> group()`,
      },
      {
        id: "influx_percentile",
        label: "Latency Percentiles",
        concept: "quantile",
        description: "Calculate percentiles over a time range — p50, p95, p99 for SLA monitoring",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "response_time_ms")
  |> filter(fn: (r) => r._field == "p95")
  |> quantile(q: 0.95, method: "estimate_tdigest")`,
      },
    ],
  },
  {
    category: "Transformations",
    icon: "⚙️",
    description: "map, derivative, pivot — reshape and transform time-series data",
    queries: [
      {
        id: "influx_pivot",
        label: "Pivot Fields to Columns",
        concept: "pivot()",
        description: "Turn field rows into columns — like PIVOT in SQL, great for multi-metric comparison",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "system_metrics")
  |> filter(fn: (r) => r._field == "cpu_percent" or r._field == "memory_percent")
  |> aggregateWindow(every: 6h, fn: mean, createEmpty: false)
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 14)`,
      },
      {
        id: "influx_derivative",
        label: "Rate of Change",
        concept: "derivative()",
        description: "Calculate how fast a value is changing per second — unique to time-series DBs",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "pipeline_events")
  |> filter(fn: (r) => r._field == "count")
  |> filter(fn: (r) => r.stage == "applied")
  |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
  |> derivative(unit: 1d, nonNegative: true)`,
      },
      {
        id: "influx_map",
        label: "map() — Transform Values",
        concept: "map()",
        description: "Apply a function to every row — like a computed column, convert ms to seconds",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "response_time_ms")
  |> filter(fn: (r) => r._field == "p95")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> map(fn: (r) => ({r with _value: r._value / 1000.0, unit: "seconds"}))
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 24)`,
      },
    ],
  },
  {
    category: "Time Comparisons",
    icon: "⏱️",
    description: "Compare periods, detect trends, time-shift data",
    queries: [
      {
        id: "influx_this_vs_last_week",
        label: "This Week vs Last Week",
        concept: "timeShift()",
        description: "Shift one series back by a week for comparison — period-over-period analysis",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "pipeline_events")
  |> filter(fn: (r) => r._field == "count")
  |> filter(fn: (r) => r.stage == "applied")
  |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
  |> timeShift(duration: -7d)`,
      },
      {
        id: "influx_anomaly",
        label: "Anomaly Detection (3σ)",
        concept: "stddev + mean",
        description: "Flag data points outside 3 standard deviations — statistical anomaly detection",
        apiPath: "/api/influxdb/query",
        flux: `data = from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "interview_scores")
  |> filter(fn: (r) => r._field == "score")
  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)

mean = data |> mean() |> findRecord(fn: (key) => true, idx: 0)
stddev = data |> stddev() |> findRecord(fn: (key) => true, idx: 0)

data
  |> map(fn: (r) => ({
      r with
      zscore: (r._value - mean._value) / stddev._value,
      is_anomaly: if (r._value - mean._value) / stddev._value > 2.0 or
                     (r._value - mean._value) / stddev._value < -2.0
                  then "yes" else "no"
    }))`,
      },
      {
        id: "influx_increase",
        label: "Cumulative Increase",
        concept: "increase()",
        description: "Calculate cumulative growth over a time range — total applications received",
        apiPath: "/api/influxdb/query",
        flux: `from(bucket: "hiring")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "pipeline_events")
  |> filter(fn: (r) => r.stage == "applied")
  |> filter(fn: (r) => r._field == "count")
  |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
  |> cumulativeSum()`,
      },
    ],
  },
];

export const allInfluxQueries: QueryItem[] = influxQueryCategories.flatMap(
  (cat) => cat.queries
);
