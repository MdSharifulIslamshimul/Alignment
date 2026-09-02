# Coupon Abuse Prevention with Fingerprint

**A step-by-step playbook for VS Code + Claude Code extension.**
Source doc: <https://docs.fingerprint.com/docs/coupon-abuse-use-case-tutorial>

You'll wire Fingerprint's device-identification into the coupon-redemption flow
so a returning device can't reuse a one-time code (like `NEW25`), even from a
new email, incognito window, or fresh account. The trick is one persistent
`visitor_id` per physical device, plus a "Suspect Score" that flags obvious
tampering (bots, headless browsers, VPN heuristics, browser spoofing).

## What Fingerprint gives you

- `visitor_id` — a stable ID for the device, resistant to cookie clearing and
  incognito. This is the ID you gate coupon redemptions on.
- `event_id` — a one-time reference to a single identification event. The
  browser hands this to your backend; the backend uses it to fetch the verified
  event from Fingerprint's Server API. **Never trust the visitor_id from the
  browser — always fetch it server-side using the event_id.**
- **Smart Signals** — a set of tamper checks on the event:
  - `bot` — `good`, `bad`, or `not_detected`
  - `suspect_score` — 0–100 aggregate; the tutorial uses >20 as the block threshold
  - VPN, IP blocklist, browser tampering, and more (surface via the same `getEvent()` call)

## Architecture

```
[ Browser ]                             [ Your backend ]              [ Fingerprint ]
   |                                          |                              |
   |  1. load agent + fp.get() → event_id     |                              |
   |───────────────────────────────────────>  |                              |
   |                                          |  2. getEvent(event_id)       |
   |                                          |─────────────────────────────>|
   |                                          |  <─── visitor_id + signals ──|
   |                                          |                              |
   |                                          |  3. check bot / suspect / redeemed
   |                                          |     record redemption
   |                                          |                              |
   |  4. { success | error }                  |                              |
   | <────────────────────────────────────────|                              |
```

---

## Prerequisites

- VS Code with the **Claude Code extension** installed and signed in.
- Node.js 18+.
- Your website's repo open in VS Code.
- Ability to add a public env var to the frontend build and a secret env var to
  the backend (Vercel / Netlify / your host).

---

## Step 1 — Create a Fingerprint account and get the keys

1. Sign up at <https://dashboard.fingerprint.com>.
2. Create an application. Pick a region (**US**, **EU**, or **Asia-Pacific**) —
   this matters, you'll pass it to both the agent and the SDK.
3. In the app's API Keys panel, copy:
   - **Public API Key** — used in the browser, safe to ship.
   - **Secret API Key** — server-only, never ships to the browser.

Add them to your project:

```bash
# .env  (server-only, gitignored)
FP_SECRET_API_KEY=fp_secret_xxx
FP_REGION=us   # or eu / ap

# .env.local  (Next.js) or your Vite env for the FRONTEND
NEXT_PUBLIC_FP_API_KEY=pk_xxx
NEXT_PUBLIC_FP_REGION=us
# or for Vite:
VITE_FP_API_KEY=pk_xxx
VITE_FP_REGION=us
```

Confirm `.env*` is in `.gitignore`. Add the same vars to your host's dashboard
(Vercel → Settings → Environment Variables) so production has them.

---

## Step 2 — Add the frontend agent (via Claude Code)

Open the file that renders your coupon input (the checkout page, the pricing
page — wherever the user types the code). Then in VS Code, open the Claude Code
sidebar and paste this prompt:

> **Prompt to Claude Code (frontend):**
>
> Add Fingerprint device identification to the coupon input on this page.
> Use `@fingerprintjs/fingerprintjs-pro` and initialize it once at module scope.
> Read the public API key from `import.meta.env.VITE_FP_API_KEY` and the region
> from `import.meta.env.VITE_FP_REGION` (fall back to `"us"`).
> When the user clicks the "Apply" button on the coupon field, call
> `fp.get()` to obtain an `event_id`, then POST `{ coupon, eventId }` to
> `/api/validate-coupon`. Show the returned success or error message. Do not
> block the button while the agent loads — lazy-load the agent on first paint.
> Return only the diff needed.

The generated code will look like this (adapt to whichever framework you use):

```jsx
// CouponField.jsx
import { useState, useEffect, useRef } from 'react'
import { load } from '@fingerprintjs/fingerprintjs-pro'

export function CouponField() {
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const fpPromise = useRef(null)

  useEffect(() => {
    fpPromise.current = load({
      apiKey: import.meta.env.VITE_FP_API_KEY,
      region: import.meta.env.VITE_FP_REGION || 'us',
    })
  }, [])

  const apply = async () => {
    if (!code.trim()) return
    setBusy(true); setMsg(null)
    try {
      const fp = await fpPromise.current
      const { requestId: eventId } = await fp.get()
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon: code.trim(), eventId }),
      })
      const data = await res.json()
      setMsg(data.success
        ? `${data.discountPct}% applied.`
        : (data.error || 'Coupon failed.'))
    } catch {
      setMsg('Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex gap-2">
      <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="Coupon code" className="flex-1 h-9 px-3 border rounded-md" />
      <button onClick={apply} disabled={busy}
        className="h-9 px-4 rounded-md bg-emerald-500 text-white">
        {busy ? 'Applying…' : 'Apply'}
      </button>
      {msg && <div className="text-xs mt-2">{msg}</div>}
    </div>
  )
}
```

Install the dependency:

```bash
npm install @fingerprintjs/fingerprintjs-pro
```

> Note on the field name: the Pro agent returns `{ requestId }`, but the docs
> and older tutorials sometimes call it `event_id` — it's the same value. Pass
> whatever you get from `fp.get()` straight through to your backend.

---

## Step 3 — Add the backend validation route (via Claude Code)

Open your API folder (`api/`, `app/api/`, `pages/api/`, `server/`, wherever your
routes live). In Claude Code paste:

> **Prompt to Claude Code (backend):**
>
> Add a POST route at `/api/validate-coupon` that accepts `{ coupon, eventId }`.
> Use `@fingerprintjs/fingerprintjs-pro-server-api-node-sdk` to call
> `getEvent(eventId)`. Then apply this check order and return early on the first
> failure:
> 1. `eventId` and `coupon` are non-empty.
> 2. The event's `products.identification.data.requestId` matches `eventId`
>    (event freshness — reject if the event is older than 3 minutes).
> 3. Bot signal: `products.botd.data.bot.result === 'notDetected'`.
> 4. Suspect Score: `products.suspectScore.data.result <= 20`.
> 5. VPN: `products.vpn.data.result === false`.
> 6. Look up the coupon in the DB (or a static map for now). If not found → 404.
> 7. Look up `(coupon.code, visitorId)` in a `redemptions` table. If exists →
>    "Coupon has already been redeemed."
> 8. Insert the redemption row.
> 9. Return `{ success: true, discountPct }`.
> Read the secret key from `process.env.FP_SECRET_API_KEY` and region from
> `process.env.FP_REGION`. Never trust `visitorId` from the request body — only
> from the fetched event.

Expected output (Node / Express-style):

```js
// api/validate-coupon.js
import {
  FingerprintJsServerApiClient,
  Region,
} from '@fingerprintjs/fingerprintjs-pro-server-api-node-sdk'
import { db } from './db.js'

const client = new FingerprintJsServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: { us: Region.Global, eu: Region.EU, ap: Region.AP }[process.env.FP_REGION || 'us'],
})

const MAX_EVENT_AGE_MS = 3 * 60 * 1000        // 3 minutes
const SUSPECT_SCORE_MAX = 20                   // block above this

export async function POST(req, res) {
  try {
    const { coupon, eventId } = req.body || {}
    if (!coupon || !eventId) return res.status(400).json({ success: false, error: 'Coupon or event missing.' })

    const event = await client.getEvent(eventId)
    const identification = event.products?.identification?.data
    const bot = event.products?.botd?.data?.bot?.result
    const suspectScore = event.products?.suspectScore?.data?.result ?? 0
    const vpn = event.products?.vpn?.data?.result === true

    // 2. Event freshness — block replayed event_ids
    if (!identification || identification.requestId !== eventId) {
      return res.status(400).json({ success: false, error: 'Invalid event.' })
    }
    const eventAge = Date.now() - new Date(identification.timestamp).getTime()
    if (eventAge > MAX_EVENT_AGE_MS) {
      return res.status(400).json({ success: false, error: 'Event expired. Reload and try again.' })
    }

    // 3–5. Smart Signals
    if (bot !== 'notDetected')          return res.status(403).json({ success: false, error: 'Coupon validation failed.' })
    if (suspectScore > SUSPECT_SCORE_MAX) return res.status(403).json({ success: false, error: 'Coupon validation failed.' })
    if (vpn)                             return res.status(403).json({ success: false, error: 'Coupon validation failed.' })

    // 6. Coupon lookup
    const row = db.prepare('SELECT code, discountPct FROM coupons WHERE code = ?').get(coupon)
    if (!row) return res.status(404).json({ success: false, error: 'Coupon not found.' })

    // 7. One-per-device — visitorId comes from the SERVER event, never the client
    const visitorId = identification.visitorId
    const already = db.prepare('SELECT 1 FROM redemptions WHERE code = ? AND visitorId = ? LIMIT 1')
      .get(coupon, visitorId)
    if (already) return res.status(409).json({ success: false, error: 'Coupon has already been redeemed.' })

    // 8. Record redemption
    db.prepare('INSERT INTO redemptions (code, visitorId, createdAt) VALUES (?, ?, ?)')
      .run(coupon, visitorId, Date.now())

    // 9. Success
    return res.json({ success: true, discountPct: row.discountPct })
  } catch (err) {
    console.error('coupon validation error', err)
    return res.status(500).json({ success: false, error: 'Coupon validation failed.' })
  }
}
```

Install the server SDK:

```bash
npm install @fingerprintjs/fingerprintjs-pro-server-api-node-sdk
```

---

## Step 4 — The tables

SQLite (or Postgres — same shape):

```sql
create table coupons (
  code         text primary key,
  discountPct  integer not null
);

create table redemptions (
  id         integer primary key autoincrement,
  code       text not null,
  visitorId  text not null,
  createdAt  bigint not null,
  unique (code, visitorId)
);

insert into coupons (code, discountPct) values ('NEW25', 25);
```

For your Neeva app you'd use Supabase — the shape is identical. The unique
constraint on `(code, visitorId)` is your last line of defense against a race
condition where two requests hit at the same millisecond.

---

## Step 5 — The Smart Signals worth knowing

The tutorial highlights bot + suspect_score. In practice, add these too — they
all come back from the same `getEvent()` call, no extra requests:

| Signal | Where | What it means |
|---|---|---|
| `bot.result` | `products.botd.data` | `notDetected` / `good` (search bots) / `bad` (headless, automation) |
| `suspectScore.result` | `products.suspectScore.data` | 0–100. Weighted rollup of all signals. Tutorial cutoff: 20. |
| `vpn.result` | `products.vpn.data` | boolean. Coupon abuse via cheap VPN rotation is common. |
| `ipBlocklist.result` | `products.ipBlocklist.data` | boolean. Known malicious IPs. |
| `tor.result` | `products.tor.data` | boolean. Almost always safe to block for coupons. |
| `tampering.result` | `products.tampering.data` | boolean. Browser fingerprint doesn't match native APIs. |
| `virtualMachine.result` | `products.virtualMachine.data` | boolean. Emulator / VM. |
| `incognito.result` | `products.incognito.data` | boolean. **Don't block on this alone** — many legit users. |

Your `block if any of these are true` list starts with **bot, vpn, ipBlocklist,
tor, tampering, virtualMachine, suspectScore > 20**. Log everything, block only
what's high-confidence — you don't want to lose real customers to a jumpy score.

---

## Step 6 — Test in VS Code

1. Start your dev server (`npm run dev`).
2. Open the coupon page, apply `NEW25`. Confirm 25% success.
3. Reload, apply `NEW25` again — you should get "already redeemed."
4. Open an **incognito window**, apply `NEW25` — still "already redeemed." The
   visitor_id is stable across incognito.
5. **Bot test**: run Playwright headless against the page (default it's a bot):
   ```bash
   npx playwright open http://localhost:3000
   ```
   Apply the coupon — the backend should reject with "Coupon validation failed."
6. Watch the Network tab: `/api/validate-coupon` returns 200 (success), 409
   (already redeemed), 403 (bot / VPN / suspect), or 400 (bad input).

---

## Step 7 — What to do about false positives

You'll get some. Real users on corporate VPNs, on privacy browsers, on brand-new
devices with no history — Fingerprint may score them suspiciously. Two moves:

1. **Log every rejection with the full event.** Don't just log the score —
   store the full `products` object for 30 days so you can review any support
   ticket and see exactly which signal tripped.
2. **Have a manual override path.** For high-value customers, expose a support
   flow: they contact you, you look up the event by `eventId`, and either
   whitelist their `visitorId` or reset the `(code, visitorId)` redemption row.

Don't add a "captcha fallback" — that trains real users to expect friction, and
the abusers solve captchas cheaper than you think. Prefer a hard block + easy
support contact.

---

## Cost & rate limits

Fingerprint's free tier gives you 20K identifications/month; the pro tiers scale
from there. Each coupon-page **paint** doesn't have to call `fp.get()` — only
call it when the user clicks Apply. That keeps your identification volume tied
to real redemption attempts, not pageviews.

There's no documented rate limit on the Server API in the coupon tutorial, but
`getEvent()` is fast (~200ms) — no need to cache it, since each event_id is
one-shot.

---

## Claude Code prompt shortcuts

Save these as VS Code snippets or a personal Claude Code playbook — paste
verbatim whenever you're wiring this into a new page:

```text
# Add Fingerprint agent to a page
"Add Fingerprint (@fingerprintjs/fingerprintjs-pro) to the coupon input on
this page. Init once at module scope, read the public key from
import.meta.env.VITE_FP_API_KEY. On Apply click, call fp.get() and POST
{coupon, eventId} to /api/validate-coupon."

# Add the backend route
"Create /api/validate-coupon that validates via Fingerprint Server API.
Reject on: event mismatch, event >3min old, bot!=notDetected, suspectScore>20,
vpn/tor/ipBlocklist/tampering/vm true. Then check redemptions table for
(code, visitorId). Insert on success. Return {success, discountPct} or
{success:false, error}."

# Add the DB migration
"Add a coupons + redemptions table (schema in COUPON_ABUSE_FINGERPRINT.md).
Seed NEW25 = 25% discount. Unique index on (code, visitorId)."
```

---

## References

- Tutorial: <https://docs.fingerprint.com/docs/coupon-abuse-use-case-tutorial>
- JS agent (Pro): <https://dev.fingerprint.com/docs/js-agent>
- Server SDK (Node): <https://github.com/fingerprintjs/fingerprintjs-pro-server-api-node-sdk>
- Smart Signals reference: <https://dev.fingerprint.com/docs/smart-signals-overview>
- Dashboard: <https://dashboard.fingerprint.com>
