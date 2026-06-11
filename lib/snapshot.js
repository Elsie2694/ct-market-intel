// Builds a normalised snapshot for one catchment from PropertyData.
// Two endpoints:
//   /prices  -> data.raw_data: live listings (price, beds, type, days_on_market, sstc, portal, url)
//   /agents  -> data.<portal>.sale[]: agents with units_offered, total_value, branches
// We merge agents across portals so an agent listing on both Rightmove and Zoopla
// counts once with combined units.

import { fetchPrices, fetchPricesPerSqf, fetchAgents } from "./propertydata.js";
import { isOurAgent } from "../data/catchments.js";

const num = (v) =>
  typeof v === "number" && isFinite(v) ? v : Number.isFinite(+v) ? +v : null;

function prettyType(t) {
  if (!t) return "—";
  return t.replace(/_/g, " ").replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

function buildProperties(rawData) {
  return (rawData || []).map((p) => ({
    channel: "sale",
    address: p.address ? p.address.trim() : "—",
    portal: p.portal || "—",
    price: num(p.price),
    beds: num(p.bedrooms),
    type: prettyType(p.type),
    daysOnMarket: num(p.days_on_market),
    underOffer: p.sstc === 1 || p.sstc === "1",
    url: p.url || null,
  }));
}

// Merge the /agents response (grouped by portal) into one ranked agent table.
function buildAgents(agentsResp) {
  if (!agentsResp.ok) return { rows: [], error: agentsResp.message };
  const byPortal = agentsResp.data.data || {};
  const merged = {};
  for (const [portal, channels] of Object.entries(byPortal)) {
    for (const a of channels.sale || []) {
      const key = a.agent || "Unknown";
      if (!merged[key])
        merged[key] = { name: key, units: 0, totalValue: 0, branches: new Set(), portals: new Set() };
      merged[key].units += num(a.units_offered) || 0;
      merged[key].totalValue += num(a.total_value) || 0;
      (a.branches || []).forEach((b) => merged[key].branches.add(b));
      merged[key].portals.add(portal.replace(".co.uk", "").replace(".com", ""));
    }
  }
  const rows = Object.values(merged)
    .map((m) => ({
      name: m.name,
      listings: m.units,
      avgValue: m.units ? Math.round(m.totalValue / m.units) : null,
      branches: [...m.branches],
      portals: [...m.portals],
      ours: isOurAgent(m.name),
    }))
    .sort((a, b) => b.listings - a.listings);
  const total = rows.reduce((s, r) => s + r.listings, 0);
  rows.forEach((r) => (r.share = total ? Math.round((r.listings / total) * 1000) / 10 : 0));
  return { rows, total, error: null };
}

export async function buildSnapshot(catchment) {
  const pc = catchment.postcode;

  const [prices, agentsResp] = await Promise.all([fetchPrices(pc), fetchAgents(pc)]);

  const errors = [];
  let props = [];
  let avg = null,
    radius = null,
    points = null,
    range70 = null;

  if (prices.ok) {
    const d = prices.data.data || {};
    props = buildProperties(d.raw_data);
    avg = num(d.average);
    radius = num(d.radius);
    points = num(d.points_analysed);
    range70 = d["70pc_range"] || null;
  } else {
    errors.push("prices: " + prices.message);
  }

  const agentTable = buildAgents(agentsResp);
  if (agentTable.error) errors.push("agents: " + agentTable.error);

  // optional £/sqft
  let ppsf = null;
  const ppsfResp = await fetchPricesPerSqf(pc);
  if (ppsfResp.ok) ppsf = num(ppsfResp.data.data?.average ?? ppsfResp.data.average);

  const underOffer = props.filter((p) => p.underOffer).length;
  const avgDom = props.length
    ? Math.round(props.reduce((s, p) => s + (p.daysOnMarket || 0), 0) / props.length)
    : null;

  const ours = agentTable.rows.find((r) => r.ours) || null;

  return {
    catchmentId: catchment.id,
    name: catchment.name,
    postcode: pc,
    type: catchment.type,
    note: catchment.note || null,
    refreshedAt: new Date().toISOString(),
    radiusMiles: radius,
    pointsAnalysed: points,
    kpis: {
      totalForSale: props.length,
      underOffer,
      avgDaysOnMarket: avgDom,
      competingAgents: agentTable.rows.length,
      medianAskingPrice: avg,
      medianPricePerSqf: ppsf,
      priceRange70: range70,
    },
    ourPosition: ours
      ? { listings: ours.listings, share: ours.share, rank: agentTable.rows.indexOf(ours) + 1 }
      : null,
    agents: agentTable.rows,
    properties: props,
    errors,
  };
}
