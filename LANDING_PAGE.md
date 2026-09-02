# Neeva Landing Page — 10× Simple Brief

A copy-paste brief for an AI (Claude, v0, Lovable, Cursor) or a designer.
Ship in one afternoon. One page. One goal. Zero fluff.

---

## The rule of one

**One audience.** A founder or head of product/ops at a small startup (10–50 people)
who's tired of dashboards nobody opens and follow-ups that die in Slack.

**One promise.** *"See what your team is actually doing this week, in one place."*

**One CTA.** `Try it free` → opens the app at `neeva-app.vercel.app`.
No email gate on the marketing page. Sign-in happens inside the app (Google OAuth).

If a section doesn't serve those three, cut it.

---

## Page structure (top → bottom)

Six blocks. Nothing more.

### 1. Hero (above the fold)

- **Kicker** (tiny, muted): `Neeva · Project Alignment Tracker`
- **H1** (~48–56px, tight): `Your week, on one page.`
- **Sub** (~18px, muted, ≤ 20 words): `Metrics, follow-ups, and open questions —
  captured once, seen by everyone, forgotten by no one.`
- **Primary CTA**: `Try it free →`  · **Secondary text link**: `See how it works ↓`
  (smooth-scrolls to block 3)
- **Visual to the right** (desktop) or below (mobile): one clean screenshot of
  `/cadence` — the Weekly Alignment Huddle. Rounded corners, subtle shadow, no
  browser chrome. Alt: "Weekly cadence table showing this week's priorities."

### 2. The three pills (a single row of three)

Each pill: one icon, three-word title, one sentence. No bullet lists.

| Icon | Title | One-liner |
|---|---|---|
| 📊 | Operating Metrics | Every objective, initiative, and target in one editable table — with follow-up dates that surface the overdue work. |
| 🗓 | Weekly Cadence | Follow-ups grouped by week and quarter. Nothing hides. Nothing repeats. |
| 📡 | Signals | Every question, problem, and opportunity from your meetings — themed, decided, or dismissed. Never forgotten. |

### 3. One story (the *how it works*)

Not a feature grid. Three screenshots stacked vertically, each with a single
caption line above it, ~500-word cadence total across the block.

1. **Capture** — screenshot: `/signals` list view.
   *"Every signal from every meeting, in the room where the decision will be made."*
2. **Align** — screenshot: `/cadence` week view.
   *"Priorities and blockers ship weekly. See the whole quarter without opening a tab."*
3. **Answer** — screenshot: `/signals/:id` detail page.
   *"Background, problem, goal, positioning, risks. When a decision comes up, the context is already there."*

### 4. Social proof (one line, one number, one quote)

Skip if you don't have it. **Never fabricate.** If real, one row:
- Number: `12 teams · 400+ signals captured this quarter`
- Quote (≤ 20 words) from a real user, with name + role.

### 5. Second CTA (mirror of the hero, no image)

- Small kicker: `Ready?`
- H2: `Set up your first huddle in 4 minutes.`
- Same primary CTA button. That's it.

### 6. Footer (one line)

`© Neeva · MIT · github.com/MdSharifulIslamshimul/Alignment`

---

## Design rules

- **Grid.** Max content width **1120px**, centered. Hero can go to 1280.
- **Type.** Inter (already in the app). Weights 400 / 600 / 700. Nothing else.
- **Color.** One neutral palette (`slate-50` background, `slate-900` text) + **one**
  accent, either indigo-500 or emerald-500. Not both. Buttons use the accent.
- **Whitespace > words.** Every section: ≥ 80px vertical padding on desktop, 48px on mobile.
- **No gradients on text.** No emoji as decoration inside blocks (the pill icons above are the exception).
- **No hero video.** No animated background. No parallax. No scroll-jacking.
- **Rounded corners** `rounded-xl` for all cards, `rounded-lg` for buttons.
- **Shadows.** Screenshots: `shadow-[0_20px_60px_rgba(15,23,42,0.10)]`. Nothing else gets a shadow.
- **Dark mode.** Optional. If added: same rules, flip neutrals only, keep the accent.

## Copy rules

- ≤ 20 words per headline. ≤ 40 per subline.
- Present tense, active voice. `Ships weekly.` not `Ships every week.`
- No "revolutionize / seamless / cutting-edge / unlock / leverage." Ever.
- Every button verb starts with a word that says *what happens next*: `Try`, `See`, `Open`, `Ship`.
- Never write feature lists as bullets. Turn them into sentences.

## What to leave OUT

- No pricing table (product is a free internal tool).
- No FAQ (if a question comes up more than twice, put the answer in the app's empty state instead).
- No "trusted by" logo strip unless you have three logos you can show today.
- No testimonials from anyone who wouldn't say the exact quote on a call.
- No cookie banner unless the site actually sets cookies.
- No newsletter signup.

---

## Tech (build path)

Same stack as the app so it lives in the same repo:

- **Vite + React + Tailwind** (already installed)
- New route: `src/pages/Landing.jsx`
- In `src/App.jsx`, add `<Route path="/welcome" element={<Landing />} />` (or make
  `/welcome` the marketing page and keep `/` as the app dashboard). Landing page
  is **unauthenticated** — do NOT wrap in `<ProtectedRoute>`.
- Deploy: pushes to `main` auto-deploy via Vercel git integration (already wired).

Screenshots: put them in `public/marketing/` — hero.png, capture.png, align.png, answer.png.
Take them at 1440×900 in the actual app; crop tight; export as PNG or WebP.

## The 10× simple test

Before you ship, check every block against these:

1. Would this page still make sense with **half** the words?
2. Would the design still work in **black and white**?
3. Can a first-time visitor answer *"what is this and should I click"* in **8 seconds** without scrolling?
4. Have you removed **at least three things** that felt "polished" but weren't earning their space?
5. Is the primary CTA visible from **every** section without scrolling more than one screen?

If any answer is no, keep cutting.

---

## Hand-off prompt (paste into your AI of choice)

> Build a one-page landing page at `src/pages/Landing.jsx` for Neeva, a project-
> alignment tracker for small startup teams. Read `LANDING_PAGE.md` at the repo
> root for the full brief — it is authoritative. Use Vite + React + Tailwind,
> Inter font, one neutral palette + one accent (indigo-500), no gradients on
> text, max width 1120px. Six blocks: hero, three pills, three-screenshot
> "how it works", one-line social proof (skip if empty), second CTA, one-line
> footer. Primary CTA everywhere: `Try it free` linking to `/` (the app).
> Route it at `/welcome`, unauthenticated. Ship in one file if possible; extract
> subcomponents only when a block exceeds ~60 lines. Copy stays under the word
> caps in the brief. When done, run `npx vite build` and open a PR titled
> `Add /welcome landing page`.
