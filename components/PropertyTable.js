"use client";

import { useMemo, useState } from "react";
import { gbp, num } from "./ui.js";

export function PropertyTable({ properties = [] }) {
  const [channel, setChannel] = useState("all"); // all | sale | rent
  const [agent, setAgent] = useState("all");
  const [sort, setSort] = useState({ key: "price", dir: "desc" });

  const agentOptions = useMemo(() => {
    const set = new Set(properties.map((p) => p.agent).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [properties]);

  const rows = useMemo(() => {
    let r = properties.filter((p) => (channel === "all" ? true : p.channel === channel));
    if (agent !== "all") r = r.filter((p) => p.agent === agent);
    const { key, dir } = sort;
    r = [...r].sort((a, b) => {
      const av = a[key] ?? -Infinity;
      const bv = b[key] ?? -Infinity;
      if (typeof av === "string") return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return dir === "asc" ? av - bv : bv - av;
    });
    return r;
  }, [properties, channel, agent, sort]);

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
          {["all", "sale", "rent"].map((c) => (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={`px-3 py-1.5 capitalize ${channel === c ? "bg-brand-red text-white" : "bg-white text-brand-cocoa"}`}
            >
              {c === "all" ? "All" : c === "sale" ? "For sale" : "To rent"}
            </button>
          ))}
        </div>
        <select
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
          className="rounded-lg border border-brand-cotton/50 bg-white px-3 py-1.5 text-brand-cocoa"
        >
          {agentOptions.map((a) => (
            <option key={a} value={a}>{a === "all" ? "All agents" : a}</option>
          ))}
        </select>
        <span className="text-brand-cocoa/60">{rows.length} properties</span>
      </div>

      <div className="tablewrap overflow-x-auto rounded-xl border border-brand-cotton/40 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-cocoa text-white">
              {head("address", "Address")}
              {head("agent", "Agent")}
              {head("type", "Type")}
              {head("beds", "Beds", true)}
              {head("price", "Price", true)}
              {head("pricePerSqf", "£/sq ft", true)}
              <th className="px-3 py-2 font-semibold text-left">Ch.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={i} className={p.ours ? "bg-brand-red/10 font-medium" : i % 2 ? "bg-brand-cotton/5" : ""}>
                <td className="px-3 py-2 max-w-[280px] truncate" title={p.address}>
                  {p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-brand-red underline-offset-2 hover:underline">{p.address}</a> : p.address}
                </td>
                <td className="px-3 py-2" style={p.ours ? { color: "#B1181E" } : undefined}>{p.agent}</td>
                <td className="px-3 py-2">{p.type}</td>
                <td className="px-3 py-2 text-right">{p.beds ?? "—"}</td>
                <td className="px-3 py-2 text-right">{p.channel === "rent" ? (p.price ? gbp(p.price) + " pcm" : "—") : gbp(p.price)}</td>
                <td className="px-3 py-2 text-right">{p.pricePerSqf ? gbp(p.pricePerSqf) : "—"}</td>
                <td className="px-3 py-2 text-xs uppercase text-brand-cocoa/60">{p.channel}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-brand-cocoa/50">No matching properties.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-brand-cocoa/50">
        £/sq ft is derived from agent floorplans where available and is indicative only.
      </p>
    </div>
  );
}
