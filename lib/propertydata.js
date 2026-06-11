// Server-side PropertyData API client.
// Key is read from process.env.PROPERTYDATA_API_KEY and never sent to the browser.

const BASE = "https://api.propertydata.co.uk";

function requireKey() {
  const key = process.env.PROPERTYDATA_API_KEY;
  if (!key) throw new Error("PROPERTYDATA_API_KEY is not set");
  return key;
}

async function pdGet(endpoint, params = {}) {
  const key = requireKey();
  const qs = new URLSearchParams({ key, ...params }).toString();
  const url = `${BASE}/${endpoint}?${qs}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  let json;
  try {
    json = await res.json();
  } catch {
    return { ok: false, message: `${endpoint}: non-JSON response (HTTP ${res.status})` };
  }
  if (json.status === "error") {
    return { ok: false, message: json.message || `${endpoint} error`, code: json.code };
  }
  return { ok: true, data: json };
}

// /prices — live for-sale listings (data.raw_data) plus area average and bands.
export function fetchPrices(postcode) {
  return pdGet("prices", { postcode });
}

// /agents — agents ranked by live units, grouped by portal then sale/rent.
export function fetchAgents(postcode) {
  return pdGet("agents", { postcode });
}

// /prices-per-sqf — optional; used if available, ignored if the plan rejects it.
export function fetchPricesPerSqf(postcode) {
  return pdGet("prices-per-sqf", { postcode });
}
