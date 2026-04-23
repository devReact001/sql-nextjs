import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { body, index } = await req.json();

    const esIndex = index || "_all";
    const url = `${process.env.ELASTICSEARCH_URL}/${esIndex}/_search`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${process.env.ELASTICSEARCH_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: Date.now() - startTime,
        error:
          data.error?.reason ||
          data.error?.root_cause?.[0]?.reason ||
          "Elasticsearch query failed",
      });
    }

    // Handle aggregation-only responses (size: 0)
    if (
      data.aggregations &&
      (!data.hits?.hits || data.hits.hits.length === 0)
    ) {
      const aggs = data.aggregations;
      const aggRows: Record<string, any>[] = [];
      const aggColumns = new Set<string>();

      for (const [aggName, aggResult] of Object.entries(
        aggs as Record<string, any>
      )) {
        if (aggResult.buckets) {
          // terms / date_histogram aggregation
          for (const bucket of aggResult.buckets) {
            const row: Record<string, any> = {
              [aggName]: bucket.key_as_string ?? bucket.key,
              count: bucket.doc_count,
            };
            // nested sub-aggs
            for (const [subKey, subVal] of Object.entries(bucket)) {
              if (["key", "doc_count", "key_as_string"].includes(subKey))
                continue;
              const sub = subVal as any;
              if (sub?.value !== undefined) row[subKey] = sub.value;
            }
            Object.keys(row).forEach((k) => aggColumns.add(k));
            aggRows.push(row);
          }
        } else if (aggResult.value !== undefined) {
          // single-value metric
          const row: Record<string, any> = {
            metric: aggName,
            value: aggResult.value,
          };
          Object.keys(row).forEach((k) => aggColumns.add(k));
          aggRows.push(row);
        } else if (aggResult.count !== undefined) {
          // stats aggregation
          const row: Record<string, any> = {
            metric: aggName,
            count: aggResult.count,
            min: aggResult.min,
            max: aggResult.max,
            avg: aggResult.avg,
            sum: aggResult.sum,
          };
          Object.keys(row).forEach((k) => aggColumns.add(k));
          aggRows.push(row);
        }
      }

      return NextResponse.json({
        columns: Array.from(aggColumns),
        rows: aggRows,
        rowCount: aggRows.length,
        executionTime: Date.now() - startTime,
      });
    }

    // Normal hits response
    const hits = data.hits?.hits ?? [];
    if (hits.length === 0) {
      return NextResponse.json({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: Date.now() - startTime,
      });
    }

    // Flatten _source + add _score and _id
    const rows: Record<string, any>[] = hits.map((hit: any) => ({
      _id: hit._id,
      _score: hit._score ?? null,
      ...hit._source,
    }));

    // Derive columns from all rows (union of keys)
    const colSet = new Set<string>();
    rows.forEach((r) => Object.keys(r).forEach((k) => colSet.add(k)));
    const columns = Array.from(colSet);

    return NextResponse.json({
      columns,
      rows,
      rowCount: data.hits?.total?.value ?? rows.length,
      executionTime: Date.now() - startTime,
    });
  } catch (err: any) {
    return NextResponse.json({
      columns: [],
      rows: [],
      rowCount: 0,
      executionTime: Date.now() - startTime,
      error: err?.message || "Elasticsearch query failed",
    });
  }
}