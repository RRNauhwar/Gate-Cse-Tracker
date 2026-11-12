# G4Gate Route Inventory & Layout Analysis

This document provides a comprehensive inventory of all discovered routes on `https://g4gate.com`, their authentication requirements, layout structures, and observed behavior.

---

## 1. Route Classification Matrix

Through programmatic browser navigation and target discovery via REA, every linked route from the application was audited.

### Publicly Accessible Routes (Unauthenticated)

| Route | Page Title | Access Level | Layout Type | Screenshot |
|---|---|---|---|---|
| `/login` | `Login \| G4Gate` | Public | Auth Center Card + Footer | [login.png](screenshots/login.png) |
| `/signup` | `Signup \| G4Gate` | Public | Auth Center Card + Footer | [signup.png](screenshots/signup.png) |
| `/forgot-password` | `Forgot Password \| G4Gate` | Public | Auth Center Card + Footer | [forgot-password.png](screenshots/forgot-password.png) |
| `/about` | `G4Gate — Study Tracker for GATE and DSA Aspirants` | Public | Content Page + Footer | [about.png](screenshots/about.png) |
| `/contact` | `G4Gate — Study Tracker for GATE and DSA Aspirants` | Public | Content Page + Footer | [contact.png](screenshots/contact.png) |
| `/privacy-policy` | `G4Gate — Study Tracker for GATE and DSA Aspirants` | Public | Content Page + Footer | [privacy-policy.png](screenshots/privacy-policy.png) |
| `/terms-and-conditions` | `G4Gate — Study Tracker for GATE and DSA Aspirants` | Public | Content Page + Footer | [terms-and-conditions.png](screenshots/terms-and-conditions.png) |
| `/cancellation-and-refund` | `G4Gate — Study Tracker for GATE and DSA Aspirants` | Public | Content Page + Footer | [cancellation-and-refund.png](screenshots/cancellation-and-refund.png) |
| `/shipping-and-delivery` | `G4Gate — Study Tracker for GATE and DSA Aspirants` | Public | Content Page + Footer | [shipping-and-delivery.png](screenshots/shipping-and-delivery.png) |

### Protected Routes (Redirecting to Login)

All application feature routes require authentication. When an unauthenticated visitor attempts to access any of these endpoints, Next.js server-side / middleware redirection automatically redirects the user to `/login?next=<encoded-route>`.

| Route | Redirection Observed | Feature Description (from Server Action catalog) | Tier |
|---|---|---|---|
| `/` or `/dashboard` | `https://g4gate.com/login` | Advanced To-do List & Dashboard Hub | Free |
| `/syllabus` | `https://g4gate.com/login?next=%2Fsyllabus` | Official Syllabus Tracker with topic checklists | Pro |
| `/tests` | `https://g4gate.com/login?next=%2Ftests` | Test Series attempt logs & weakness analytics | Free |
| `/prepare-for-gate` | `https://g4gate.com/login?next=%2Fprepare-for-gate` | Comprehensive preparation roadmap & guides | Pro |
| `/calendar` | `https://g4gate.com/login?next=%2Fcalendar` | Preparation calendar & historical task timeline | Free |
| `/timer` | `https://g4gate.com/login?next=%2Ftimer` | Pomodoro focus timer with auto-logging per subject | Pro |
| `/calculator` | `https://g4gate.com/login?next=%2Fcalculator` | GATE Scientific Calculator simulation | Pro |
| `/whiteboard` | `https://g4gate.com/login?next=%2Fwhiteboard` | Interactive scratchpad & calculation board | Pro |
| `/quotes` | `https://g4gate.com/login?next=%2Fquotes` | Motivational Quote Studio & OBS overlay builder | Pro |
| `/ctr` | `https://g4gate.com/login?next=%2Fctr` | Concepts That Resonate (CTR) & Doubts board | Pro |
| `/notes` | `https://g4gate.com/login?next=%2Fnotes` | Centralized note-taking repository | Free |
| `/leaderboard` | `https://g4gate.com/login?next=%2Fleaderboard` | Aspirant ranking, rooms, study time leaderboards | Free/Pro |
| `/dsa-community` | `https://g4gate.com/login?next=%2Fdsa-community` | Interview questions, jobs, and DSA discussions | Pro |
| `/livestream` | `https://g4gate.com/login?next=%2Flivestream` | Standalone livestream capture view with countdown | Pro |
| `/diagram-maker` | `https://g4gate.com/login?next=%2Fdiagram-maker` | Circuit, automata, graph & K-Map studio | Pro |
| `/konsa-teacher` | `https://g4gate.com/login?next=%2Fkonsa-teacher` | Teacher & lecture series comparison directory | Free |
| `/profile` | `https://g4gate.com/login?next=%2Fprofile` | User stats, streak counter & settings | Free |
| `/u/[username]` | `https://g4gate.com/u/...` | Publicly shareable prep profile | Free |

---

## 2. Page Layouts & Structural Analysis

### A. Auth Layout (`/login`, `/signup`, `/forgot-password`)

```
+-------------------------------------------------------------+
|                                                             |
|                   [ G4Gate Logo (64x64) ]                   |
|                      "Welcome Back"                         |
|           "Log in to continue your preparation."            |
|                                                             |
|           [ Google Sign-In Button (GSI Iframe) ]            |
|                                                             |
|                   --- OR ---                                |
|                                                             |
|   USERNAME OR EMAIL                                         |
|   [ text input                                    ]         |
|   [ @gmail.com ] (Domain quick-tag button)                  |
|                                                             |
|   PASSWORD                               Forgot?            |
|   [ password input                      ] [Eye toggle]      |
|                                                             |
|   [             Sign In (Submit Button)          ]          |
|                                                             |
|          Don't have an account? Sign up here                |
|                                                             |
+-------------------------------------------------------------+
| FOOTER (Full 4-column layout)                               |
+-------------------------------------------------------------+
```

1. **Card Container:**
   - Classes: `bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl`
   - Centered vertically and horizontally inside `<main class="flex min-h-screen flex-col items-center justify-center p-4">`.
2. **Branding:**
   - Center logo image: `width="64" height="64"` pointing to `/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fg4gate%20logo.334m-3jvgeti7.png&w=128&q=75`.
3. **Google Sign-In Container:**
   - Hosted in an iframe originating from `accounts.google.com/gsi/button`.
   - The container enforces `colorScheme: "light"` for the button iframe while the parent card remains dark.

### B. Informational / Legal Content Layout (`/about`, `/contact`, etc.)

1. **Header / Breadcrumb:**
   - Includes a subtle back-navigation link: `<a href="/" class="...">Back to Home</a>` with a left arrow icon.
2. **Article / Proportional Reading Container:**
   - Container: `max-w-4xl mx-auto px-4 py-12` with text hierarchy:
     - Heading 1: `text-3xl font-extrabold text-white mb-6`
     - Paragraphs: `text-slate-300 leading-relaxed mb-6 space-y-4`
     - Section subheads: `text-xl font-bold text-slate-100 mt-8 mb-4`
3. **Contact Page specifics:**
   - Official support email: `contact@g4gate.com`
   - WhatsApp community links for aspirants
   - Registered address and escalation point for payments

---

## 3. Global Reusable Footer Analysis

The global footer is rendered consistently across all public pages:

```
+----------------------------------------------------------------------------------------------------+
| Column 1: Brand & Bio           Column 2: Quick Links    Column 3: Legal & Info   Column 4: Community  |
| - Logo & G4Gate title          - Dashboard              - About Us               - Description text   |
| - Value proposition blurb       - Official Syllabus      - Contact Us             - YouTube Subscribe  |
| - YouTube link button           - Test Series            - Privacy Policy         - WA Doubt Group     |
| - Copy email button             - How to Prepare...      - Terms & Conditions     - WA App Updates     |
|   (contact@g4gate.com)          - Calendar               - Cancellation & Refund                       |
|                                 - Pomodoro Timer         - Shipping & Delivery                         |
|                                 - Whiteboard                                                           |
|                                 - Motivational Quotes                                                  |
+----------------------------------------------------------------------------------------------------+
| © 2026 G4Gate Tracker. All rights reserved.          [About] [Contact] [Privacy] [Terms] [Refunds]... |
+----------------------------------------------------------------------------------------------------+
```

### Footer Technical DOM Details:
- Root tag: `footer class="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4"`
- Grid system: `grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto`
- Interactive Copy Email Button: Includes an inline SVG copy icon that copies `contact@g4gate.com` to the user's clipboard and displays a transient tooltip/state.
- External Links:
  - YouTube channel link: Opens `https://youtube.com/@g4gate` in a new tab (`target="_blank" rel="noopener noreferrer"`)
  - WhatsApp groups: Direct invite links for doubts and app release announcements

---

## 4. Responsive Layout Behavior (Desktop vs Mobile)

Observed via REA device metric overrides (`width: 390, height: 844, deviceScaleFactor: 2, mobile: true`):

| Viewport Element | Desktop (>= 1024px) | Mobile (375px - 430px) |
|---|---|---|
| **Auth Card Width** | `max-w-md` (448px fixed) with comfortable padding | `w-full` with `p-5` margin padding, full viewport width |
| **Input Fields** | Horizontal alignment for helper tag buttons | Full-width input with stacked `@gmail.com` pill button |
| **Footer Columns** | 4 distinct columns (`grid-cols-4`) side-by-side | Single column stack (`grid-cols-1`) with 24px vertical gap |
| **Legal Sub-footer** | Single horizontal row with flex space-between | Wrapped 2-row layout with centered links |
| **Navigation** | Direct links visible | Overflow links adapt to standard vertical mobile scrolling |
