// Cooper and Tanner office catchments.
// Each entry anchors a full postcode; the PropertyData API expands a radius
// around it until it finds enough data points and returns the actual radius used.
// `id` is used as the KV storage key suffix and the URL slug.

export const CATCHMENTS = [
  { id: "chew-magna",      name: "Chew Magna",       postcode: "BS40 8BG", type: "Frontier (test)",        note: "Competitive frontier toward Bristol" },
  { id: "castle-cary",     name: "Castle Cary",      postcode: "BA7 7BG",  type: "Residential" },
  { id: "cheddar",         name: "Cheddar",          postcode: "BS27 3NA", type: "Residential + Lettings" },
  { id: "frome",           name: "Frome",            postcode: "BA11 1AR", type: "Residential + Lettings" },
  { id: "glastonbury",     name: "Glastonbury",      postcode: "BA6 9DS",  type: "Residential" },
  { id: "midsomer-norton", name: "Midsomer Norton",  postcode: "BA3 2HP",  type: "Residential" },
  { id: "shepton-mallet",  name: "Shepton Mallet",   postcode: "BA4 5AS",  type: "Residential + Lettings" },
  { id: "professional-hub",name: "Professional Hub", postcode: "BA4 4PE",  type: "Professional" },
  { id: "street",          name: "Street",           postcode: "BA16 0EN", type: "Residential + Lettings" },
  { id: "standerwick",     name: "Standerwick / Sale Rooms", postcode: "BA11 2QB", type: "Sale Rooms" },
  { id: "warminster",      name: "Warminster",       postcode: "BA12 9AN", type: "Residential + Lettings" },
  { id: "wedmore",         name: "Wedmore",          postcode: "BS28 4EG", type: "Residential" },
  { id: "wells",           name: "Wells",            postcode: "BA5 2DJ",  type: "Residential" },
];

// The agent name(s) that represent us, for highlighting in league tables.
// PropertyData normalises agent names across portals; we match case-insensitively
// on any of these substrings.
export const OUR_AGENT_MATCHERS = ["cooper and tanner", "cooper & tanner", "cooper tanner"];

export function isOurAgent(name = "") {
  const n = name.toLowerCase();
  return OUR_AGENT_MATCHERS.some((m) => n.includes(m));
}

export function getCatchment(id) {
  return CATCHMENTS.find((c) => c.id === id) || null;
}
