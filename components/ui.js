"use client";

export const BRAND = {
  red: "#B1181E",
  cocoa: "#452129",
  cotton: "#A6A684",
  cottonLight: "#EDEDE3",
};

// Chart palette in the documented brand order, with derived tints for >3 series.
export const PALETTE = ["#B1181E", "#452129", "#A6A684", "#C95459", "#6E4751", "#C4C4A8"];

export function gbp(n, { compact = false } = {}) {
  if (n == null || isNaN(n)) return "—";
  if (compact && n >= 1000) {
    return "£" + new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n);
  }
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

export function num(n) {
  if (n == null || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-GB").format(n);
}

export function pct(n) {
  if (n == null || isNaN(n)) return "—";
  return `${n}%`;
}

export function timeAgo(iso) {
  if (!iso) return "never";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export function KpiCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-brand-cotton/40 bg-white px-5 py-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-brand-cotton font-semibold">{label}</div>
      <div className="mt-1 text-2xl font-bold text-brand-cocoa">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-brand-cocoa/60">{sub}</div> : null}
    </div>
  );
}
