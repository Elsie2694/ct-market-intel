// Builds a normalised snapshot for one catchment from the raw PropertyData responses.
// This is where we tolerate the API's quirks (insufficient-data errors, varying shapes)
// and reduce everything to the fields the dashboard actually renders.

import {
  fetchAgents,
  fetchSourcedProperties,
  fetchPrices,
  fetchPricesPerSqf,
  fetchSoldPrices,
  fetchRents,
  fetchDemand,
} from "./propertydata.js";
import { isOurAgent } from "../data/catchments.js";

// Safely pluck a number, returning null on anything non-numeric.
const num = (v) => (typeof v === "number" && isFinite(v) ? v : Number.isFinite(+v) ? +v : null);

// Build the agent league table from /agents.
function buildAgentTable(agentsResp) {
  if (!agentsResp.ok) return { rows: [], error: agentsResp.message };
  // PropertyData /agents returns data.agents: [{ name, total, ... }]
  const list = agentsResp.data?.agents || agentsResp.data?.data || [];
  const total = list.reduce((s, a) => s + (num(a.total) || 0), 0) || 0;
  const rows = list
    .map((a) => ({
      name: a.name || "Unknown",
      listings: num(a.total) || 0,
      share: total ? Math.round(((num(a.total) || 0) / total) * 1000) / 10 : 0,
      ours: isOurAgent(a.name || ""),
    }))
    .sort((x, y) => y.listings - x.listings);
  return { rows, totalListings: total, error: null };
}

// Build the property list from /sourced-properties.
function buildPropertyList(resp, channel) {
  if (!resp.ok) return [];
  const props = resp.data?.properties || resp.data?.data || [];
  return props.map((p) => ({
    channel, // "sale" | "rent"
    address: p.address || p.display_address || "—",
    agent: p.agent || p.agent_name || "—",
    ours: isOurAgent(p.agent || p.agent_name || ""),
    price: num(p.price ?? p.asking_price),
    beds: num(p.bedrooms ?? p.beds),
    type: p.type || p.property_type || "—",
    sqf: num(p.sqf ?? p.floor_area),
    pricePerSqf: num(p.price_per_sqf),
    url: p.url || null,
  }));
}

// Pull a single representative average out of a /prices-style response.
function avgFrom(resp) {
  if (!resp.ok) return null;
  const d = resp.data || {};
  return num(d.average ?? d.data?.average ?? d.long_let?.average ?? null);
}

export async function buildSnapshot(catchment) {
  const pc = catchment.postcode;

  // Fire requests; PropertyData advises async use, so we parallelise per catchment.
  const [agents, sale, rent, prices, ppsf, sold, rents, demand] = await Promise.all([
    fetchAgents(pc),
    fetchSourcedProperties(pc, "for-sale"),
    fetchSourcedProperties(pc, "to-rent"),
    fetchPrices(pc),
    fetchPricesPerSqf(pc),
    fetchSoldPrices(pc),
    fetchRents(pc),
    fetchDemand(pc),
  ]);

  const agentTable = buildAgentTable(agents);
  const saleProps = buildPropertyList(sale, "sale");
  const rentProps = buildPropertyList(rent, "rent");

  // The radius the API actually expanded to (returned on most area endpoints).
  const radius =
    num(agents.data?.radius) ??
    num(prices.data?.radius) ??
    num(sale.data?.radius) ??
    null;

  const ours = agentTable.rows.find((r) => r.ours) || null;

  return {
    catchmentId: catchment.id,
    name: catchment.name,
    postcode: pc,
    type: catchment.type,
    note: catchment.note || null,
    refreshedAt: new Date().toISOString(),
    radiusMiles: radius,
    kpis: {
      totalForSale: saleProps.length,
      totalToRent: rentProps.length,
      competingAgents: agentTable.rows.length,
      medianAskingPrice: avgFrom(prices),
      medianPricePerSqf: avgFrom(ppsf),
      medianSoldPrice: avgFrom(sold),
      medianRent: avgFrom(rents),
      demandRating: demand.ok ? (demand.data?.rating ?? demand.data?.percentage ?? null) : null,
    },
    ourPosition: ours
      ? { listings: ours.listings, share: ours.share, rank: agentTable.rows.indexOf(ours) + 1 }
      : null,
    agents: agentTable.rows,
    properties: [...saleProps, ...rentProps],
    errors: [agents, sale, rent, prices, ppsf, sold, rents, demand]
      .filter((r) => !r.ok)
      .map((r) => r.message),
  };
}
