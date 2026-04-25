import { NextRequest, NextResponse } from "next/server";
import { getHistoryStats, getQueryHistory } from "@/lib/pgvector";

export async function POST(req: NextRequest) {
  try {
    const { filterDb } = await req.json().catch(() => ({}));

    const [stats, history] = await Promise.all([
      getHistoryStats(),
      getQueryHistory(30, filterDb),
    ]);

    if (stats.total === 0) {
      return new Response("You haven't run any queries yet! Start exploring the databases and I'll summarize what you've learned.", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    const recentQueries = history
      .slice(0, 15)
      .map((q) => `[${q.db}] ${q.query_label ?? q.query_text?.slice(0, 60)} (${q.concept ?? ""})`)
      .join("\n");

    const dbBreakdown = Object.entries(stats.byDb)
      .map(([db, count]) => `${db}: ${count}`)
      .join(", ");

    const prompt = `You are an expert database educator summarizing a learner's exploration session.

Session stats:
- Total queries run: ${stats.total}
- Queries by database: ${dbBreakdown}
- Success rate: ${stats.successRate}%
- Average execution time: ${stats.avgExecTime}ms

Recent queries explored:
${recentQueries}

Write a 3-4 sentence personalized learning summary that:
1. Highlights which database paradigms they've explored most
2. Points out interesting patterns or concepts they've practiced
3. Identifies gaps — which databases or concepts they haven't tried yet
4. Ends with one specific recommendation for what to explore next

Be warm, encouraging, and specific. No bullet points or headers — flowing prose only.`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicRes.body?.getReader();
        if (!reader) { controller.close(); return; }
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "content_block_delta" && data.delta?.text) {
                controller.enqueue(encoder.encode(data.delta.text));
              }
            } catch {}
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
