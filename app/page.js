"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { num, pct, timeAgo } from "../components/ui.js";

export default function Home() {
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/snapshot")
      .then((r) => r.json())
      .then((d) => { setIndex(d); setLoading(false); })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, []);

  const catchments = index?.catchments || [];

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <header className="mb-8 border-b border-brand-cotton/40 pb-5">
        <div className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">Cooper and Tanner</div>
        <h1 className="mt-1 text-3xl font-bold text-brand-cocoa">Market Intelligence</h1>
        <p className="mt-2 text-sm text-brand-cocoa/70">
          Competitor listings, pricing and instruction share across our catchments.
          {index?.updatedAt ? <> Last refreshed {timeAgo(index.updatedAt)}.</> : null}
        </p>
      </header>

      {loading && <p className="text-brand-cocoa/60">Loading…</p>}
      {error && <p className="text-brand-red">Error: {error}</p>}

      {!loading && !catchments.length && (
        <div className="rounded-xl border border-brand-cotton/40 bg-white p-6 text-sm">
          <p className="font-semibold text-brand-cocoa">No data yet.</p>
          <p className="mt-1 text-brand-cocoa/70">
            Run the refresh job once to populate the dashboard (visit <code>/api/refresh</code> with
            the cron secret, or wait for the scheduled nightly run).
          </p>
        </div>
      )}

      {!!catchments.length && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catchments.map((c) => (
            <Link
              key={c.id}
              href={`/catchment/${c.id}`}
              className="group rounded-xl border border-brand-cotton/40 bg-white p-5 shadow-sm transition hover:border-brand-red hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-brand-cocoa group-hover:text-brand-red">{c.name}</div>
                  <div className="text-xs text-brand-cocoa/60">{c.postcode} · {c.type}</div>
                </div>
                {c.hadErrors ? <span title="Some data incomplete" className="text-brand-cotton text-xs">⚠</span> : null}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xl font-bold text-brand-cocoa">{num(c.totalForSale)}</div>
                  <div className="text-[10px] uppercase tracking-wide text-brand-cotton">For sale</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-brand-cocoa">{num(c.totalToRent)}</div>
                  <div className="text-[10px] uppercase tracking-wide text-brand-cotton">To rent</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-brand-red">{c.ourShare != null ? pct(c.ourShare) : "—"}</div>
                  <div className="text-[10px] uppercase tracking-wide text-brand-cotton">Our share</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-brand-cocoa/50">Refreshed {timeAgo(c.refreshedAt)}</div>
            </Link>
          ))}
        </div>
      )}

      <footer className="mt-10 border-t border-brand-cotton/40 pt-4 text-xs text-brand-cocoa/50">
        Data via PropertyData (Rightmove, Zoopla, OnTheMarket &amp; Land Registry). Listings near
        real-time; sold prices lag monthly. For internal Cooper and Tanner use.
      </footer>
    </main>
  );
}
