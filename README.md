# Cooper and Tanner — Market Intelligence Dashboard

A Next.js app that tracks competitor listings, pricing and instruction share across
all Cooper and Tanner catchments, using the **PropertyData** API (which legitimately
aggregates Rightmove, Zoopla, OnTheMarket and Land Registry data).

A scheduled nightly job pulls a fresh snapshot for each catchment into **Vercel KV**;
the dashboard reads only from KV, so it loads instantly and never exposes the API key.

---

## What it shows

- **Overview page** (`/`) — every catchment as a card: live for-sale count, to-rent
  count, and our instruction share. Click through for detail.
- **Catchment page** (`/catchment/[id]`) — KPI cards (stock, avg asking price, avg
  £/sq ft, avg sold price, avg rent, demand rating), a **competitor league table** with
  Cooper and Tanner highlighted, a market-share chart, and a **filterable/sortable
  property table** (by agent, by sale/rent, by any column).

---

## One-time setup (≈20–30 min)

You'll need: a GitHub account, a Vercel account (free tier is fine), and a PropertyData
API key (start with the 14-day free trial).

### 1. Get a PropertyData key
- Sign up for the API trial at https://propertydata.co.uk/api/pricing
- Copy your API key from the dashboard.
- (Optional but recommended) test it locally first — see "Local test" below.

### 2. Push this project to GitHub
```bash
cd ct-market-intel
git init && git add . && git commit -m "Initial commit"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/ct-market-intel.git
git push -u origin main
```

### 3. Create the project on Vercel
- vercel.com → Add New → Project → import the GitHub repo.
- Framework preset: **Next.js** (auto-detected). Don't deploy yet — add storage and
  env vars first (next two steps).

### 4. Add Vercel KV
- In the project → **Storage** → Create → **KV**. Accept the defaults and link it to
  this project. Vercel injects the `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars
  automatically — you don't copy them by hand.

### 5. Add environment variables
Project → **Settings → Environment Variables**:

| Name | Value |
|------|-------|
| `PROPERTYDATA_API_KEY` | your PropertyData key |
| `CRON_SECRET` | any long random string (e.g. from a password generator) |

### 6. Deploy
- Click **Deploy**. When it's live you'll get a URL like `ct-market-intel.vercel.app`.

### 7. Populate the data the first time
The cron runs nightly (04:00 UTC), but you don't want to wait. Trigger one manual run:
```bash
curl -H "Authorization: Bearer <your CRON_SECRET>" \
  https://<your-app>.vercel.app/api/refresh
```
You'll get back a JSON summary (how many catchments refreshed, any failures). Reload
the dashboard and the cards will be populated.

---

## Local test (optional, before deploying)

Confirm your key works and see the real data shapes for one catchment:
```bash
npm install
PROPERTYDATA_API_KEY=xxxxx npm run refresh:local chew-magna
```
This prints the snapshot to the terminal — no KV needed.

> Note: the field-mapping in `lib/snapshot.js` is built to PropertyData's documented
> response shapes, but a couple of endpoints (e.g. `sourced-properties`) vary slightly
> by plan. Run this once during the trial and, if any field comes back empty, the raw
> shape is easy to eyeball and adjust in `lib/snapshot.js`.

---

## Configuration

- **Catchments** — edit `data/catchments.js`. Each is a full anchor postcode; the API
  expands its own radius around it (returned as `radiusMiles` and shown in the UI).
- **Refresh schedule** — `vercel.json` (`0 4 * * *` = 04:00 UTC daily). Listings move
  slowly; nightly is plenty.
- **Our-agent matching** — `OUR_AGENT_MATCHERS` in `data/catchments.js` controls what
  counts as "us" for highlighting.

## Credit budget

~7 endpoints × 14 catchments ≈ 100 credits per nightly run ≈ 3,000/month. The
**API 5k plan (£48/mo ex VAT)** covers this comfortably with headroom.

## Before going live for colleagues

PropertyData's terms permit broad use, but you're displaying **competitor** data to a
team. Send PropertyData one line confirming internal multi-user display is within your
licence. Quick email; worth doing.

## Data caveats (surfaced in the UI too)

- £/sq ft is read from agent floorplans where available — indicative, not exact.
- Sold prices come from the Land Registry and lag by roughly a month.
- Listings are near real-time but drop off when removed from portals.
- Access is by link only (no login), as requested — keep the URL internal. Auth can be
  added later (Vercel password protection, or a simple shared-password middleware).
