"use client";

import { useMemo, useState } from "react";
import { gbp, num } from "./ui.js";

export function PropertyTable({ properties = [] }) {
  
  const [status, setStatus] = useState("all"); // all | available | under
  const [sort, setSort] = useState({ key: "price", dir: "desc" });


  const rows = useMemo(() => {
    let r = properties;
    
    if (status === "available") r = r.filter((p) => !p.underOffer);
    if (status === "under") r = r.filter((p) => p.underOffer);
    const { key, dir } = sort;
    r = [...r].sort((a, b) => {
      const av = a[key] ?? -Infinity;
      const bv = b[key] ?? -Infinity;
      if (typeof av === "string") return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return dir === "asc" ? av - bv : bv - av;
    });
    return r;
  }, [properties, status, sort]);

  const head = (key, label, right) => (
    <th
      onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }))}
      className={`px-3 py-2 font-semibold cursor-pointer select-none ${right ? "text-right" : "text-left"}`}
    >
      {label}{sort.key === key ? (sort.dir === "desc" ? " ▾" : " ▴") : ""}
    </th>
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex rounded-lg border border-brand-cotton/50 overflow-hidden">
          {[["all", "All"], ["available", "Available"], ["under", "Under offer"]].map(([c, label]) => (
            <button
              key={c}
              onClick={() => setStatus(c)}
              className={`px-3 py-1.5 ${status === c ? "bg-brand-red text-white" : "bg-white text-brand-cocoa"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-brand-cocoa/60">{rows.length} properties</span>
      </div>

      <div className="tablewrap overflow-x-auto rounded-xl border border-brand-cotton/40 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-cocoa text-white">
              {head("address", "Address")}
              {head("type", "Type")}
              {head("beds", "Beds", true)}
              {head("price", "Price", true)}
              {head("daysOnMarket", "Days on mkt", true)}
              <th className="px-3 py-2 font-semibold text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={i} className={i % 2 ? "bg-brand-cotton/5" : ""}>
                <td className="px-3 py-2 max-w-[280px] truncate" title={p.address}>
                  {p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-brand-red underline-offset-2 hover:underline">{p.address}</a> : p.address}
                </td>
                <td className="px-3 py-2">{p.type}</td>
                <td className="px-3 py-2 text-right">{p.beds ?? "—"}</td>
                <td className="px-3 py-2 text-right">{gbp(p.price)}</td>
                <td className="px-3 py-2 text-right">{p.daysOnMarket ?? "—"}</td>
                <td className="px-3 py-2 text-xs">
                  {p.underOffer
                    ? <span className="rounded bg-brand-red/10 px-2 py-0.5 text-brand-red">Under offer</span>
                    : <span className="text-brand-cocoa/50">Available</span>}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-brand-cocoa/50">No matching properties.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
