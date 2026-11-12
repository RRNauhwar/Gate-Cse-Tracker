# G4Gate Technical Findings & Implementation Blueprint

This report details the technical architecture, design tokens, server action payloads, pricing models, feature catalog, and implementation blueprint extracted from reverse-engineering `https://g4gate.com`.

Every finding is labeled as **[Observed]**, **[Inferred]**, or **[Unknown]**.

---

## 1. Complete Server-Side Data Catalog

### A. Authentication & Session Initialization (`checkAuth`)

**Status:** **[Observed]**  
**Action Hash:** `40c360c08a52c4a8ed7dfaa57914e9d9d98e872d06`  
**Request Protocol:** HTTP POST with `next-action` header and `Accept: text/x-component`

When any page in G4Gate loads, the client calls `checkAuth` to retrieve the current user's authentication status, enabled features, active pricing plans, and maintenance flags.

#### Observed Response Structure:
```json
{
  "isAuthenticated": false,
  "isAdmin": false,
  "hasPremium": false,
  "isGlobalFree": false,
  "pageVisitTrackingEnabled": false,
  "monthlyPrice": 39,
  "yearlyPrice": 299,
  "customPlan": {
    "key": "custom",
    "months": 5,
    "days": 150,
    "price": 119,
    "label": "Till Gate 2027",
    "perMonth": 23.8,
    "listPrice": 195,
    "saves": 76,
    "savingsPct": 39
  },
  "checkout": {
    "paymentMode": "razorpay",
    "gateway": "cashfree",
    "gatewayLabel": "Cashfree",
    "gatewayLive": true,
    "whatsappNumber": "919516067571",
    "upiId": "7987446757@kotakbank",
    "razorpayLive": false,
    "razorpayKeyId": ""
  },
  "affiliateEnabled": true,
  "sessionsEnabled": false,
  "tutorialVideo": null,
  "__maintenance": {
    "checkedAt": 1793140196066,
    "status": {
      "success": true,
      "isActive": false,
      "isScheduled": false,
      "showBanner": false,
      "message": "G4Gate will be right back!!!",
      "bannerLeadSeconds": 10800,
      "bannerPollSeconds": 21600,
      "bypassValid": false
    }
  }
}
```

---

### B. Subscription Plans & Pricing Catalog

**Status:** **[Observed]**

The platform maintains two separate subscription tracks: Main G4Gate Platform Pro and GATE PYQ (Previous Year Questions) Finder.

#### 1. Main Platform Plans

| Plan ID | Label | Subtitle | Duration | Price (INR) | Effective/Month | Savings | Badge |
|---|---|---|---|---|---|---|---|
| `monthly` | Monthly | Full Access | 1 Month (30d) | ₹39 | ₹39.00 | 0% | Default |
| `gate-2027-rankers` | Gate 2027 Rankers | Grind last 3 months | 3 Months (90d) | ₹77 | ₹25.67 | 34% (saves ₹40) | `GATE SPECIAL` |
| `for-gate-2027` | Pro 5 Months | Long term | 5 Months (150d) | ₹119 | ₹23.80 | 39% (saves ₹76) | `RECOMMENDED` |

#### 2. PYQ Specific Plans

| Plan ID | Duration | Price (INR) | Effective/Month | Savings |
|---|---|---|---|---|
| `monthly` | 1 Month (30d) | ₹49 | ₹49.00 | Default |
| `yearly` | 12 Months (365d) | ₹499 | ₹41.58 | 15% (saves ₹89) |

*Free Sample Subjects for PYQ:*  
`["Discrete Mathematics", "Digital Logic", "Theory of Computation"]`

---

### C. Feature & Route Inventory (From Live Server Action)

**Status:** **[Observed]**

The application dynamically controls 22 distinct preparation features via the server catalog:

| Key | Feature Name | Tier | Route | Lucide Icon | Color | Purpose & Capabilities |
|---|---|---|---|---|---|---|
| `timer` | Pomodoro Focus Timer | Pro | `/timer` | `Timer` | indigo | Focus sessions, auto-logs study hours per subject, lock-screen timer continuity |
| `calculator` | GATE Scientific Calculator | Pro | `/calculator` | `Calculator` | indigo | Official GATE exam layout & controls simulator |
| `syllabus` | Syllabus Tracker | Pro | `/syllabus` | `ListChecks` | emerald | Official syllabus broken into micro-topics to tick off |
| `ctr` | Concepts & Doubts (CTR) | Pro | `/ctr` | `Lightbulb` | amber | High-yield concepts board & peer doubt resolution |
| `countdown` | GATE Countdown | Pro | `/countdown` | `CalendarClock` | cyan | Persistent real-time exam day countdown |
| `share` | Text & Link Share | Pro | `/share` | `Link2` | purple | Zero-login cross-device snippet sharing (`g4gate.com/s/...`) |
| `leaderboard-analysis` | Leaderboard & Rooms | Pro | `/leaderboard` | `Trophy` | amber | Aspirant ranks, study streaks, room joins, test comparisons |
| `dsa-community` | DSA Community | Pro | `/dsa-community` | `Users` | emerald | Interview experiences, job/internship openings, DSA advice |
| `quotes` | Motivational Quote Studio | Pro | `/quotes` | `Sparkles` | purple | Custom quote player & OBS-ready browser overlays |
| `livestream` | Livestream Capture View | Pro | `/livestream` | `Rocket` | rose | Streamer layout: leaderboard, countdown, rotating motivation |
| `diagram-maker` | Diagram Maker & K-Map | Pro | `/diagram-maker` | `Share2` | teal | Circuits, automata, graphs, flowcharts, K-Map simplification, SVG/PNG export |
| `tasks` | Advanced To-do List | Free | `/` | `ListTodo` | sky | Daily task planner, date-bound history review |
| `notes` | All Notes, One Place | Free | `/notes` | `NotebookPen` | orange | Centralized searchable note repository |
| `tests` | Test Series & Analytics | Free | `/tests` | `BarChart3` | emerald | Attempt logging, accuracy breakdown, weak-topic analytics |
| `calendar` | Calendar | Free | `/calendar` | `Calendar` | amber | Chronological preparation log and upcoming deadlines |
| `profile` | User Profile | Free | `/profile` | `User` | indigo | User stats, active streaks, and personal settings |
| `public-profile` | Public Profile | Free | `/u/[username]` | `UserCircle` | purple | Shareable profile URL showcasing hours, streak, and progress |
| `konsa-teacher` | Konsa Teacher | Free | `/konsa-teacher` | `GraduationCap` | rose | Subject-by-subject faculty & lecture comparison guide |
| `leaderboard` | Leaderboard & Motivation | Free | `/leaderboard` | `Sparkles` | amber | Baseline leaderboard viewing (competition details require Pro) |
| `practice-arena` | Practice Arena | Free | Subdomain | `Dumbbell` | teal | Timed practice browser tests (`practice.g4gate.com`) |
| `pyq-find` | GATE PYQ Find | Free | Subdomain | `Search` | sky | Fast topic-based PYQ search (`pyqfind.g4gate.com`) |
| `notifications` | Notification Center | Free | `/notification` | `Bell` | cyan | System announcements, peer replies, reminder inbox |

---

## 2. Server Action Protocol & References

**Status:** **[Observed]**

Next.js Server Actions are used for all mutative and authenticated operations instead of traditional REST endpoints.

| Server Action Name | Action ID Hash | Client Chunk | Purpose |
|---|---|---|---|
| `checkAuth` | `40c360c08a52c4a8ed7dfaa57914e9d9d98e872d06` | `2ntiymojg1a0c.js` | Returns session, plans, features, and system health |
| `authUser` | `40ec5256880375f809bfb3c1cd43f2ca9342f3bd70` | `410eh9dg3j4na.js` | Email & password login authentication |
| `googleAuthServer` | `40cf8f2bd306d6fcbb0d3226ce2d1b31f6a8de42cf` | `410eh9dg3j4na.js` | Google OAuth GSI credential token exchange |
| `linkGoogleAccount` | `601d393a398ec09515bd4e86494db91fff19283dea` | `410eh9dg3j4na.js` | Links Google credentials to existing account |
| `requestEmailVerification`| `009cec2335470210651f807e9db7a24990172614be` | `0blrc7wd6mgpk.js` | Sends verification OTP/code on signup |
| `forgotPassword` | `40796f55a3a523d268876933ec3c308f63033b242e` | `1lie_a0fgel2q.js` | Dispatches password reset link |
| `logout` | `00bdaa14d415e4cdb5b816f43aeb4b322b4f34484e` | `0blrc7wd6mgpk.js` | Invalidates session cookie |

---

## 3. Design System & CSS Variables

**Status:** **[Observed]**  
**Source:** `2plogtsmbfmxv.css`

### A. Core Color Palette
```css
:root {
  --background: #0a0b0e;        /* Ultra-dark slate/black background */
  --foreground: #e4e6ea;        /* Off-white text */
  color-scheme: dark;

  /* Card Surfaces */
  --card-bg: #1e293b;           /* Tailwind slate-800 */
  --card-border: #334155;       /* Tailwind slate-700 */
  --input-bg: #0f172a;          /* Tailwind slate-900 */
  --input-border: #334155;      /* Tailwind slate-700 */

  /* Hairlines & Borders */
  --hairline: #ffffff14;
  --hairline-strong: #ffffff24;

  /* Premium Depth Shadows */
  --shadow-premium-sm: 0 1px 2px #0006, 0 1px 3px #00000040;
  --shadow-premium: 0 2px 4px #0000004d, 0 8px 24px -6px #00000080;
  --shadow-premium-lg: 0 4px 8px #0000004d, 0 20px 48px -12px #000000a6;
}
```

### B. Typography
- **Primary Font:** Geist Sans (`font-family: var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif`)
- **Code/Monospace:** Geist Mono (`font-family: var(--font-mono), ui-monospace, Menlo, Consolas`)
- **Web Fonts:** WOFF2 loaded from Next.js static media:
  - `797e433ab948586e-s.p.0r6juujl39pe6.woff2` (23 KB)
  - `caa3a2e1cccd8315-s.p.0wgildi0cnwt9.woff2` (29 KB)

---

## 4. Payment Gateway & Checkout Flow

**Status:** **[Observed]**

The platform is integrated with:
1. **Cashfree Payments:** (Primary active gateway: `"gatewayLive": true`, `"gateway": "cashfree"`).
2. **UPI Direct:** Configured fallback / merchant VPA: `7987446757@kotakbank`.
3. **WhatsApp Support & Manual Escalation:** Direct WhatsApp line at `+91 9516067571` for payment issues, manual activation, and doubts.
4. **Razorpay:** Present in codebase (`paymentMode: "razorpay"`), but currently marked inactive (`razorpayLive: false`).

---

## 5. Mobile vs Desktop Responsive Differences

**Status:** **[Observed via REA Mobile Emulation]**

1. **Card Container Adaptability:**
   - On Desktop (1280px+): Auth forms sit inside a centered, floating `max-w-md` (448px) card with rounded corners (`rounded-2xl`) and deep ambient shadows.
   - On Mobile (390px): The card occupies 100% of horizontal screen width with 16px lateral padding. Corner rounding is reduced visually to maximize input touch targets.
2. **Footer Grid:**
   - Desktop: 4 distinct columns (`grid-cols-4`) spaced evenly.
   - Mobile: Reflows cleanly into a single vertical stack (`grid-cols-1`). Links are tap-friendly with generous line-height (`leading-8`).
3. **Google Sign-In Button:**
   - In desktop and mobile views, the Google iframe dimensions adjust automatically via the Google Identity Services SDK responsive container.

---

## 6. Inferred Architecture & Remaining Unknowns

### Inferred Attributes **[Inferred]**
1. **Database:** The schema model (users, subscriptions, task logs, syllabus topics, test attempts) points toward PostgreSQL (possibly Supabase or Prisma/Drizzle on Neon/Vercel Postgres) given Next.js App Router conventions.
2. **Session Storage:** Given the use of `Server Actions` and `text/x-component` responses, user session tokens are stored in an `httpOnly` secure cookie rather than LocalStorage.

### Unknowns Requiring Authenticated Access **[Unknown]**
1. **Interactive Dashboard Internals:** The private UI components inside `/timer`, `/syllabus`, `/calculator`, and `/tests` could not be rendered without creating an authenticated user session.
2. **Exact Database Schemas:** Column names and foreign key relations for test analytics and CTR doubt threads remain internal to the server action implementations.
3. **Webhook Processing:** Cashfree webhook verification secret and signature validation logic are handled server-side.
