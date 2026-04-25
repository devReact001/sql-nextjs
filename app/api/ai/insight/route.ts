import { NextRequest, NextResponse } from "next/server";
import { saveQueryToHistory } from "@/lib/pgvector";

export async function POST(req: NextRequest) {
  try {
    const { db, queryText, queryLabel, concept, result } = await req.json();

    // Save to pgvector history (non-blocking)
    saveQueryToHistory({
      db,
      query_text: queryText,
      query_label: queryLabel,
      concept,
      row_count: result?.rowCount ?? 0,
      exec_time: result?.executionTime ?? 0,
      had_error: !!result?.error,
    }).catch(console.error);

    // Generate AI insight using streaming
    const prompt = `You are an expert database educator. A user just ran this ${db} query:

Label: ${queryLabel ?? "Custom query"}
Concept: ${concept ?? "unknown"}
Query:
${queryText?.slice(0, 800)}

Result: ${result?.error ? `Error: ${result.error}` : `${result?.rowCount ?? 0} rows returned in ${result?.executionTime ?? 0}ms`}

Give a concise 2-3 sentence insight that:
1. Explains what concept this query demonstrates
2. Compares it briefly to how another database would handle the same task
3. Suggests one natural next query to try

Be specific, educational, and encouraging. No markdown headers. Keep it conversational.`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    // Stream the response back
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicRes.body?.getReader();
        if (!reader) { controller.close(); return; }

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

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
    return NextResponse.json({ error: err?.message ?? "AI insight failed" }, { status: 500 });
  }
}
