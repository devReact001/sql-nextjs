import { NextResponse } from "next/server";
import { InfluxDB, Point, WriteApi } from "@influxdata/influxdb-client";

function getWriteApi(): WriteApi {
  const client = new InfluxDB({
    url: process.env.INFLUXDB_URL!,
    token: process.env.INFLUXDB_TOKEN!,
  });
  return client.getWriteApi(
    process.env.INFLUXDB_ORG!,
    process.env.INFLUXDB_BUCKET!,
    "s"
  );
}

// Generate realistic time-series data going back 30 days
function generatePoints(): Point[] {
  const points: Point[] = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const candidates = [
    { id: "1", name: "Alice Johnson", dept: "Engineering" },
    { id: "2", name: "Bob Smith",     dept: "Engineering" },
    { id: "3", name: "Carol Williams",dept: "Data Science" },
    { id: "4", name: "Eva Davis",     dept: "Engineering" },
    { id: "5", name: "Frank Miller",  dept: "DevOps" },
  ];
  const stages = ["applied", "screening", "technical", "final", "offer"];

  // --- interview_scores: one score per candidate per day for 30 days ---
  for (let d = 29; d >= 0; d--) {
    const ts = new Date(now - d * day);
    for (const c of candidates) {
      const baseScore = 70 + Math.random() * 25;
      points.push(
        new Point("interview_scores")
          .tag("candidate_id", c.id)
          .tag("candidate_name", c.name)
          .tag("department", c.dept)
          .floatField("score", parseFloat(baseScore.toFixed(1)))
          .timestamp(ts)
      );
    }
  }

  // --- pipeline_events: applications per stage per day ---
  for (let d = 29; d >= 0; d--) {
    const ts = new Date(now - d * day);
    for (const stage of stages) {
      // Funnel shape: more applied, fewer at offer
      const multiplier =
        stage === "applied"   ? 10 :
        stage === "screening" ? 7  :
        stage === "technical" ? 4  :
        stage === "final"     ? 2  : 1;
      const count = Math.floor(multiplier + Math.random() * multiplier * 0.5);
      points.push(
        new Point("pipeline_events")
          .tag("stage", stage)
          .intField("count", count)
          .timestamp(ts)
      );
    }
  }

  // --- response_time_ms: API/system latency per hour for 7 days ---
  for (let h = 7 * 24; h >= 0; h--) {
    const ts = new Date(now - h * 60 * 60 * 1000);
    const hour = ts.getHours();
    // Business hours spike
    const baseLatency = (hour >= 9 && hour <= 18) ? 120 : 60;
    const latency = baseLatency + Math.random() * 80;
    points.push(
      new Point("response_time_ms")
        .tag("service", "api-gateway")
        .floatField("p50", parseFloat((latency * 0.8).toFixed(1)))
        .floatField("p95", parseFloat((latency * 1.5).toFixed(1)))
        .floatField("p99", parseFloat((latency * 2.2).toFixed(1)))
        .timestamp(ts)
    );
  }

  // --- system_metrics: CPU/memory every 30 min for 7 days ---
  for (let h = 7 * 24; h >= 0; h--) {
    for (const half of [0, 30]) {
      const ts = new Date(now - h * 60 * 60 * 1000 + half * 60 * 1000);
      const cpuBase = 30 + Math.random() * 40;
      const memBase = 55 + Math.random() * 20;
      points.push(
        new Point("system_metrics")
          .tag("host", "app-server-01")
          .tag("region", "us-east")
          .floatField("cpu_percent",    parseFloat(cpuBase.toFixed(1)))
          .floatField("memory_percent", parseFloat(memBase.toFixed(1)))
          .floatField("disk_percent",   parseFloat((40 + Math.random() * 10).toFixed(1)))
          .timestamp(ts)
      );
    }
  }

  // --- email_events: open/click/send counts per day for 30 days ---
  for (let d = 29; d >= 0; d--) {
    const ts = new Date(now - d * day);
    const sends  = 50 + Math.floor(Math.random() * 30);
    const opens  = Math.floor(sends * (0.3 + Math.random() * 0.2));
    const clicks = Math.floor(opens * (0.2 + Math.random() * 0.15));
    for (const [event, value] of [["sent", sends], ["opened", opens], ["clicked", clicks]] as [string, number][]) {
      points.push(
        new Point("email_events")
          .tag("campaign", "hiring-outreach")
          .tag("event_type", event)
          .intField("count", value)
          .timestamp(ts)
      );
    }
  }

  return points;
}

export async function POST() {
  try {
    const writeApi = getWriteApi();
    const points = generatePoints();

    for (const point of points) {
      writeApi.writePoint(point);
    }

    await writeApi.close();

    return NextResponse.json({
      success: true,
      pointsWritten: points.length,
      measurements: ["interview_scores", "pipeline_events", "response_time_ms", "system_metrics", "email_events"],
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message ?? "Seed failed",
    });
  }
}
