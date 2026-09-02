# Business Alignment — 4-Step User Flow

Landing → Coupon + Plan + Sign up → Pay → Welcome.
One primary button per screen. Always going forward.

```
 1. Try It     →   2. Coupon + Plan + Sign up      →   3. Pay          →   4. Welcome
    Landing        NEW25 · plan · workspace form       Card / invoice      Into the app
```

---

## 1. Landing — the "Try It" moment

**URL:** `/`
**Purpose:** convince in 8 seconds, then click.

```
Your week, on one page.

Metrics, follow-ups, and open questions —
captured once, seen by everyone, forgotten by no one.

           [ Try It →  ]

           Used by 6 FundedNext squads.
```

**Rules:**
- One headline. One sub. One CTA.
- Below the fold: three pills (Metrics / Cadence / Signals), one social-proof line, one footer.
- `Try It →` goes to **`/start`**.

---

## 2. Coupon + Plan + Sign up (one page)

**URL:** `/start`
**Purpose:** capture intent, pick a plan, create the workspace — without leaving the page.

```
┌───────────────────────────────────────────────┐
│  Total  $37 / mo   (was $49 · NEW25)          │  ← sticky top
├───────────────────────────────────────────────┤
│  Got a code?                                   │
│  [ NEW25              ]  [ Apply ]             │
│  ✓ 25% off applied                             │
│                                                │
│  Plan                                          │
│  ● Team       up to 10 seats    $49/mo         │
│  ○ Company    up to 50 seats    $149/mo        │
│  ○ Scale      unlimited         Contact        │
│                                                │
│  ─── Create your workspace ───                 │
│  Team name    [ FundedNext                 ]   │
│  Your email   [ sharif@nextventures.io     ]   │
│  Password     [                             ]  │
│                                                │
│  [ Continue with Google ]                      │
│                                                │
│         [ Continue to payment → ]              │
└───────────────────────────────────────────────┘
```

**Rules:**
- **Total re-computes** as they change plan or apply/remove the coupon — always visible.
- Coupon validates via Fingerprint (one-per-device — see `docs/COUPON_ABUSE_FINGERPRINT.md`).
- Sign-up is inline. Google **or** email + password — pick one.
- Workspace name becomes the subdomain: `fundednext.neeva.app`.
- **Continue to payment →** advances to **`/pay`**.
- Referral URL `?coupon=NEW25` auto-fills and validates the code on page load.

**Microcopy:**
- Coupon placeholder → `Have a code?`
- Coupon success → `✓ 25% off applied`
- Coupon failure → `Coupon doesn't apply to this plan.` / `Coupon already used on this device.` / `Coupon expired.`
- Subdomain hint (below Team name) → `Your workspace: fundednext.neeva.app`

---

## 3. Pay

**URL:** `/pay`
**Purpose:** take the money without a single surprise.

```
Team · up to 10 seats
Total       $37 / mo

○ Card
○ Invoice (annual only, ≥ $500)

[ Pay $37 · start 14-day trial ]
```

**Rules:**
- Total on this page **must exactly match** what step 2 showed. If it doesn't, they bounce — hard rule.
- Stripe (or equivalent) embedded card form. Nothing else on the page — no upsells, no cross-sells.
- 14-day trial before first charge. The coupon still applies at trial end.
- Success → **`/welcome`**.

**Microcopy:**
- Under the button → `You won't be charged until [date, 14 days out]. Cancel anytime in Settings.`

---

## 4. Welcome — into the app

**URL:** `/welcome`
**Purpose:** get them running their first weekly huddle within the hour.

```
✓ Workspace ready.

Invite your team, or start capturing signals now.

[ Go to dashboard →  ]     [ Invite teammates ]
```

**Rules:**
- The dashboard link goes straight to `/cadence` (the Weekly Alignment Huddle), pre-seeded with **one** starter follow-up: `"Set up your first weekly huddle."` (deletable in one click).
- Invite opens a modal with an email-list input + one-click copy of the invite link.
- No feature tour. No welcome video. No survey.

---

## The one rule

> If a step doesn't move them closer to running their first weekly huddle, cut it.

One primary button per screen. Always going forward.
Never introduce a second CTA that competes with it.

---

## Related docs

- `LANDING_PAGE.md` — the 10× simple brief for the landing page (step 1).
- `docs/COUPON_ABUSE_FINGERPRINT.md` — Fingerprint device-ID validation for `NEW25` and any future coupon (step 2).
- `data/schema.sql` — Supabase schema underneath the app (unchanged by this flow).
