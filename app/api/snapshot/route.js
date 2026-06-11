// GET /api/snapshot            -> returns the index (all catchments, summary)
// GET /api/snapshot?id=<catchmentId> -> returns the full snapshot for one catchment
//
// Reads only from KV, so it's fast and never hits PropertyData on the request path.

import { NextResponse } from "next/server";
import { getSnapshot, getIndex } from "../../../lib/storage.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const snap = await getSnapshot(id);
    if (!snap) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(snap);
  }

  const index = await getIndex();
  if (!index) {
    return NextResponse.json(
      { error: "no data yet — run /api/refresh once to populate", catchments: [] },
      { status: 200 }
    );
  }
  return NextResponse.json(index);
}
