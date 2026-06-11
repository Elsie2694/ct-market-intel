"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { KpiCard, gbp, num, pct, timeAgo } from "../../../components/ui.js";
import { AgentLeague } from "../../../components/AgentLeague.js";
import { PropertyTable } from "../../../components/PropertyTable.js";

export default function CatchmentPage() {
  const { id } = useParams();
  const [snap, setSnap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/snapshot?id=${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Not found"))))
      .then((d) => { setSnap(d); setLoading(false); })
      .catch((e) => { setError(String(e.message || e)); setLoading(false); });
  }, [id]);

  if (loading) return <main className="mx-auto max-w-6xl px-5 py-8 text-brand-cocoa/60">Loading…</main>;
  if (error) return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <Link href="/" className="text-sm text-brand-red hover:underline">← All catchments</Link>
      <p className="mt-4 text-brand-red">Error: {error}</p>
    </main>
  );

  const k = snap.kpis;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <Link href="/" className="text-sm text-brand-red hover:underline">← All catchments</Link>

      <header className="mt-3 mb-6 border-b border-brand-cotton/40 pb-5">
        <div className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">Cooper and Tanner · Market Intelligence</div>
        <h1 className="mt-1 text-3xl font-bold text-brand-cocoa">{snap.name}</h1>
        <p className="mt-1 text-sm text-brand-cocoa/70">
          {snap.postcode} · {snap.type}
          {snap.radiusMiles != null ? <> · catchment radius ≈ {snap.radiusMiles} miles</> : null}
          {" · "}refreshed {timeAgo(snap.refreshedAt)}
        </p>
        {snap.ourPosition ? (
          <p className="mt-2 inline-block rounded-lg bg-brand-red/10 px-3 py-1 text-sm text-brand-red">
            Our position: #{snap.ourPosition.rank} by live listings · {num(snap.ourPosition.listings)} instructions · {pct(snap.ourPosition.share)} share
          </p>
        ) : (
          <p className="mt-2 inline-block rounded-lg bg-brand-cotton/15 px-3 py-1 text-sm text-brand-cocoa/70">
            No Cooper and Tanner listings detected in this catchment right now.
          </p>
        )}
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="For sale" value={num(k.totalForSale)} sub="live listings" />
        <KpiCard label="To rent" value={num(k.totalToRent)} sub="live listings" />
        <KpiCard label="Competing agents" value={num(k.competingAgents)} />
        <KpiCard label="Demand" value={k.demandRating ?? "—"} sub="PropertyData rating" />
        <KpiCard label="Avg asking price" value={gbp(k.medianAskingPrice, { compact: true })} />
        <KpiCard label="Avg £/sq ft" value={gbp(k.medianPricePerSqf)} sub="indicative" />
        <KpiCard label="Avg sold price" value={gbp(k.medianSoldPrice, { compact: true })} sub="Land Registry (lagged)" />
        <KpiCard label="Avg rent" value={k.medianRent ? gbp(k.medianRent) + " pcm" : "—"} />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold text-brand-cocoa">Competitor league</h2>
        <AgentLeague agents={snap.agents} />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold text-brand-cocoa">Properties on the market</h2>
        <PropertyTable properties={snap.properties} />
      </section>

      {snap.errors?.length ? (
        <p className="text-xs text-brand-cocoa/40">
          Note: {snap.errors.length} data source(s) returned incomplete results for this catchment.
        </p>
      ) : null}
    </main>
  );
}
