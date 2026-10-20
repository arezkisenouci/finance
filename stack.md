# Technology Stack Architecture

## 1. Executive Summary

This document specifies the technical stack for our **Mobile-First Personal Finance Web Application**. The project prioritizes snappy mobile responsiveness, offline-ready PWA capabilities, real-time currency conversion, and an ultra-lightweight, zero-overhead **JSON-only database** architecture with ACID-safe atomic writes.

---

## 2. Recommended Core Stack

```
+-------------------------------------------------------------------+
|                            CLIENT TIER                            |
|  Next.js 15 (App Router) + React 19 + TypeScript                 |
|  Tailwind CSS v4 + Shadcn/UI + Lucide Icons                       |
|  Framer Motion (Bottom Sheets, Wallet Cards, Micro-interactions)  |
|  Recharts (Mobile Responsive Touch-Friendly Charts)               |
|  Serwist / Next-PWA (Progressive Web App, Offline, Notifications) |
+-------------------------------------------------------------------+
                                  |
                                  | REST / Server Actions / Fetch
                                  v
+-------------------------------------------------------------------+
|                            SERVER TIER                            |
|  Node.js (LTS 20+) Runtime Environment                            |
|  Next.js Route Handlers / Fastify API Engine                      |
|  Zod (Runtime Request/Response Schema Validation)                 |
|  ExchangeRate-API / Frankfurter (Live Forex Integration)          |
+-------------------------------------------------------------------+
                                  |
                                  | File Locking & Atomic Writes
                                  v
+-------------------------------------------------------------------+
|                           DATABASE TIER                           |
|  Lowdb v7+ (Pure TypeScript JSON-backed Flat-File Database)       |
|  Steno (Atomic File-Writing to Prevent Race Conditions/Corruption)|
|  Automated JSON Snapshot / Backup Engine                          |
+-------------------------------------------------------------------+
```

---

## 3. Detailed Component Breakdown

### 3.1 Frontend (Mobile-First Web App)

| Technology | Role | Justification |
| :--- | :--- | :--- |
| **Next.js 15 (App Router)** | Full-Stack React Framework | Unified repository for frontend and backend API routes. Eliminates CORS issues, supports Server Components for fast initial loads, and provides flexible route handlers. |
| **React 19 & TypeScript 5** | UI Library & Type Safety | Strictly typed domain models (`Transaction`, `Routine`, `Wallet`, `CurrencyRate`) guarantees zero runtime type bugs. |
| **Tailwind CSS v4** | Utility-first Styling | Enables a 100% mobile-first design pattern (`w-full max-w-md mx-auto min-h-screen pb-24`) that feels native on iOS and Android viewports. |
| **shadcn/ui + Radix UI** | Accessible UI Components | Accessible, headless primitives tailored for mobile: Bottom sheets (`Drawer`), Dialogs, Numeric Badges, and Popovers. |
| **Framer Motion** | Mobile Micro-animations | Powers Apple Wallet-style swipeable cards, expanding bottom-sheets, smooth toggle animations, and tactile tap feedback. |
| **Recharts** | Interactive Charts | Mobile-optimized, touch-sensitive Donut and Bar charts for category breakdowns, expense velocities, and "What-If" savings comparisons. |
| **Lucide React** | Icons | Crisp, customizable SVG icons representing categories (Food, Transport, Cigarettes, Shopping, Tech, etc.). |
| **Canvas Confetti** | Gamification Feedback | Triggers celebrations when daily routines are skipped (e.g., "Saved $8 today on cigarettes!"). |

---

### 3.2 Mobile & PWA (Progressive Web App)

To make the web application feel like a native mobile app installed from the App Store:

| Tool | Purpose |
| :--- | :--- |
| **Serwist (or `@ducanh2912/next-pwa`)** | Modern service worker manager for Next.js. Enables offline data caching, background sync, and installability. |
| **Web App Manifest (`manifest.json`)** | Configures `standalone` display mode, splash screens, theme colors (`#0F172A`), and iOS home-screen icons. |
| **Web Notifications API** | Triggers local daily routine reminders (e.g., prompt at 20:00: *"Did you spend money on your routines today?"*). |

---

### 3.3 Backend API & Business Logic

| Technology | Role | Justification |
| :--- | :--- | :--- |
| **Next.js Route Handlers (`app/api/**/route.ts`)** | RESTful Endpoints | Clean, modular API routes handling CRUD transactions, wallet balance mutations, routine checks, and analytics queries. |
| **Zod** | Validation & Parsing | Strictly validates all incoming payloads (e.g., positive numbers, ISO-8601 dates, valid category enums). |
| **Date-fns** | Date Manipulation | Lightweight library for computing daily routines, weekly rollups, month-to-date aggregates, and timezone-accurate check-ins. |

---

### 3.4 Database Tier: JSON-Only Database

> [!IMPORTANT]
> The database strictly adheres to the requirement: **JSON file storage only**, with zero external database dependencies (no PostgreSQL, MongoDB, or SQLite).

To achieve high reliability, atomic persistence, and zero corruption with JSON:

| Technology | Implementation Details |
| :--- | :--- |
| **Lowdb (v7+)** | Minimalist TypeScript JSON database. Reads JSON into memory for sub-millisecond query performance and serializes updates back to disk. |
| **Steno (Atomic File-Writer)** | Underlying atomic write engine used by Lowdb. Writes to temporary files (`db.tmp`) and performs atomic file renames to guarantee data is never corrupted during sudden crashes or power cuts. |
| **File Structure** | Partitioned JSON schema or unified `db.json` with collections: `wallet`, `transactions`, `routines`, `routine_logs`, `categories`, and `exchange_rates_cache`. |
| **Backup Hook** | Automatic rolling daily backup generator that writes `backups/db-YYYY-MM-DD.json` on application boot or scheduled intervals. |

---

### 3.5 Currency Exchange Rate API

To convert wallet balance and expenses into any global currency in real time:

| Provider | Specifications |
| :--- | :--- |
| **Frankfurter API (Primary)** | 100% free, open-source API backed by the European Central Bank. Requires **no API key**, supports EUR, USD, GBP, JPY, CAD, AUD, etc., with zero rate limits. |
| **ExchangeRate-API (Fallback)** | Free tier offers 1,500 monthly requests covering 160+ fiat currencies (including DZD, MAD, EGP, INR, etc.). |
| **In-Memory & JSON Cache** | Exchange rates are cached in `exchange_rates_cache.json` with a 12-hour Time-to-Live (TTL) to avoid redundant network requests. |

---

## 4. Development & Tooling Ecosystem

- **Package Manager**: `pnpm` (Fast, disk-efficient dependency resolution)
- **Linter & Formatter**: `ESLint` + `Prettier` + `prettier-plugin-tailwindcss`
- **Testing**: `Vitest` (Blazing-fast unit tests for calculation algorithms & savings simulator)
- **Node Version**: `>= 20.x` (LTS)

---

## 5. Architectural Trade-offs & Decisions

1. **Why Next.js Fullstack instead of Separate Express + React?**
   - Single repository, single port (`http://localhost:3000`), zero CORS issues, shared TypeScript definitions between API and UI.
   - Ideal for mobile viewport deployment (Vercel, local Docker, or standalone Node.js server).
2. **Why Lowdb for JSON-only?**
   - Keeps data in an intuitive, human-readable `.json` file that can be opened, inspected, exported, and imported at any time.
   - In-memory querying allows instant dashboard renders even when computing complex month-end aggregates and What-If simulations.
