"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BRAND, num, pct, gbp } from "./ui.js";

export function AgentLeague({ agents = [] }) {
  if (!agents.length) {
    return <p className="text-sm text-brand-cocoa/60">No competitor data for this catchment yet.</p>;
  }

  const chartData = agents.slice(0, 8).map((a) => ({
    name: a.name.length > 22 ? a.name.slice(0, 21) + "…" : a.name,
    listings: a.listings,
    ours: a.ours,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* League table */}
      <div className="overflow-hidden rounded-xl border border-brand-cotton/40 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-cocoa text-white text-left">
              <th className="px-4 py-2 font-semibold">#</th>
              <th className="px-4 py-2 font-semibold">Agent</th>
              <th className="px-4 py-2 font-semibold text-right">Live</th>
              <th className="px-4 py-2 font-semibold text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a, i) => (
              <tr
                key={a.name + i}
                className={a.ours ? "bg-brand-red/10 font-semibold" : i % 2 ? "bg-brand-cotton/5" : ""}
              >
                <td className="px-4 py-2 text-brand-cocoa/70">{i + 1}</td>
                <td className="px-4 py-2" style={a.ours ? { color: BRAND.red } : undefined}>
                  {a.name}{a.ours ? "  ◂ us" : ""}
                </td>
                <td className="px-4 py-2 text-right">{num(a.listings)}</td>
                <td className="px-4 py-2 text-right">{pct(a.share)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Market share chart */}
      <div className="rounded-xl border border-brand-cotton/40 bg-white p-4">
        <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 34)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: BRAND.cocoa }} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: BRAND.cocoa }} />
            <Tooltip
              formatter={(v) => [num(v), "Live listings"]}
              contentStyle={{ fontSize: 12, borderColor: BRAND.cotton }}
            />
            <Bar dataKey="listings" radius={[0, 4, 4, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.ours ? BRAND.red : BRAND.cotton} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
