import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { body } = await req.json();

    const res = await fetch(
      `${process.env.ELASTICSEARCH_URL}/_search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `ApiKey ${process.env.ELASTICSEARCH_API_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Elasticsearch query failed" },
      { status: 500 }
    );
  }
}