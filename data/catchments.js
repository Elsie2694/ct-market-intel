// Cooper and Tanner — competitor scouting catchment.
//
// Scoped to Chew Magna only: the competitive frontier toward Bristol, where C&T
// has no office and wants to see what rival agents are doing.
//
// `query` is what we send to PropertyData. A FULL postcode (e.g. "BS40 8BG") makes
// the API expand a circle around that point until it has a solid local sample (~20+
// points) — giving a tight, village-centred catchment rather than the whole BS40
// district. To widen reach later, switch `query` to the district ("BS40").
// `postcode` is for display/reference.

export const CATCHMENTS = [
  { id: "chew-magna", name: "Chew Magna", postcode: "BS40 8BG", query: "BS40 8BG", type: "Competitor scouting", note: "Frontier toward Bristol — C&T has no office here" },
];

// Name(s) that represent us, for highlighting where we appear.
export const OUR_AGENT_MATCHERS = ["cooper and tanner", "cooper & tanner", "cooper tanner"];

export function isOurAgent(name = "") {
  const n = name.toLowerCase();
  return OUR_AGENT_MATCHERS.some((m) => n.includes(m));
}

export function getCatchment(id) {
  return CATCHMENTS.find((c) => c.id === id) || null;
}
