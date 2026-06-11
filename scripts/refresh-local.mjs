// Local test harness: hits PropertyData for ONE catchment and prints the snapshot,
// without needing Vercel KV. Useful during the trial to confirm your key works and
// to see the real response shapes before deploying.
//
// Usage:
//   PROPERTYDATA_API_KEY=xxx node scripts/refresh-local.mjs chew-magna
//
// If no catchment id is given, defaults to chew-magna.

import { CATCHMENTS, getCatchment } from "../data/catchments.js";
import { buildSnapshot } from "../lib/snapshot.js";

const id = process.argv[2] || "chew-magna";
const catchment = getCatchment(id);

if (!process.env.PROPERTYDATA_API_KEY) {
  console.error("Set PROPERTYDATA_API_KEY first, e.g.\n  PROPERTYDATA_API_KEY=xxx node scripts/refresh-local.mjs chew-magna");
  process.exit(1);
}
if (!catchment) {
  console.error(`Unknown catchment "${id}". Options:\n` + CATCHMENTS.map((c) => "  " + c.id).join("\n"));
  process.exit(1);
}

console.log(`Fetching ${catchment.name} (${catchment.postcode})…\n`);
const snap = await buildSnapshot(catchment);

console.log("KPIs:", snap.kpis);
console.log("Radius (mi):", snap.radiusMiles);
console.log("Our position:", snap.ourPosition);
console.log("\nTop agents:");
snap.agents.slice(0, 8).forEach((a, i) =>
  console.log(`  ${i + 1}. ${a.name}${a.ours ? " (US)" : ""} — ${a.listings} listings, ${a.share}%`)
);
console.log(`\nProperties pulled: ${snap.properties.length}`);
if (snap.errors.length) console.log("\nData warnings:", snap.errors);
