// GET /api/refresh
// Triggered by the Vercel cron (see vercel.json). Loops every catchment, builds a
// snapshot, stores it in KV, and updates the index. Protected by CRON_SECRET so it
// can't be triggered by anyone with the URL.
//
// Vercel cron requests include  Authorization: Bearer <CRON_SECRET>  automatically
// when CRON_SECRET is set as an env var.

import { NextResponse } from "next/server";
import { CATCHMENTS } from "../../../data/catchments.js";
import { buildSnapshot } from "../../../lib/snapshot.js";
import { saveSnapshot, saveIndex } from "../../../lib/storage.js";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // allow up to 5 min for the full loop

function authorised(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // if unset (e.g. local dev), allow
  const auth = request.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!authorised(request)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const started = Date.now();
  const index = [];
  const failures = [];

  // Sequential to stay within PropertyData's per-account rate limit comfortably.
  for (const c of CATCHMENTS) {
    try {
      const snap = await buildSnapshot(c);
      await saveSnapshot(c.id, snap);
      index.push({
        id: c.id,
        name: c.name,
        postcode: c.postcode,
        type: c.type,
        refreshedAt: snap.refreshedAt,
        totalForSale: snap.kpis.totalForSale,
        totalToRent: snap.kpis.totalToRent,
        ourShare: snap.ourPosition?.share ?? null,
        hadErrors: snap.errors.length > 0,
      });
    } catch (err) {
      failures.push({ id: c.id, error: String(err.message || err) });
    }
  }

  await saveIndex({ updatedAt: new Date().toISOString(), catchments: index });

  return NextResponse.json({
    ok: true,
    refreshed: index.length,
    failures,
    durationMs: Date.now() - started,
  });
}
