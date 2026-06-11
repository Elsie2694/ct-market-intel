// Server-side PropertyData API client.
// The API key is read from process.env.PROPERTYDATA_API_KEY and NEVER sent to the browser.
//
// PropertyData notes that endpoints do heavy run-time processing (~1s typical) and
// advise against using them on the critical request path — hence we only ever call
// this from the scheduled refresh job, store the result in KV, and serve the dashboard
// from KV. See https://propertydata.co.uk/api/documentation

const BASE = "https://api.propertydata.co.uk";

function requireKey() {
  const key = process.env.PROPERTYDATA_API_KEY;
  if (!key) throw new Error("PROPERTYDATA_API_KEY is not set");
  return key;
}

// Low-level GET with the key in the query string and basic error surfacing.
async function pdGet(endpoint, params = {}) {
  const key = requireKey();
  const qs = new URLSearchParams({ key, ...params }).toString();
  const url = `${BASE}/${endpoint}?${qs}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`PropertyData ${endpoint}: non-JSON response (HTTP ${res.status})`);
  }

  // PropertyData returns { status: "success" | "error", ... }
  if (json.status === "error") {
    // e.g. insufficient data, bad postcode, out of credits
    return { ok: false, code: json.code || "error", message: json.message || "PropertyData error", raw: json };
  }
  return { ok: true, data: json };
}

// --- Scoped endpoint wrappers -------------------------------------------------

// /agents — agents grouped by number of live listings in the area (Rightmove + OTM).
export function fetchAgents(postcode) {
  return pdGet("agents", { postcode });
}

// /sourced-properties — individual live listings (price, beds, type, agent).
// `list` controls for-sale vs to-rent style lists; we pull both.
export function fetchSourcedProperties(postcode, list = "for-sale") {
  return pdGet("sourced-properties", { postcode, list });
}

// /prices — asking-price levels for the area.
export function fetchPrices(postcode) {
  return pdGet("prices", { postcode });
}

// /prices-per-sqf — asking £/sq ft (floorplan-derived; treat as indicative).
export function fetchPricesPerSqf(postcode) {
  return pdGet("prices-per-sqf", { postcode });
}

// /sold-prices — Land Registry completions (monthly lag).
export function fetchSoldPrices(postcode) {
  return pdGet("sold-prices", { postcode });
}

// /rents — asking rents for the area (lettings side).
export function fetchRents(postcode) {
  return pdGet("rents", { postcode });
}

// /demand — market temperature (how much stock is selling vs sitting).
export function fetchDemand(postcode) {
  return pdGet("demand", { postcode });
}
