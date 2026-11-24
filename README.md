# Fifolex — Gaming Cafe Operations & Venue Management System

Fifolex is an end-to-end operations dashboard and venue management platform purpose-built for modern gaming cafes, esports arenas, and PC/console lounges. It combines an interactive 3D venue control surface with comprehensive operational tools for managing gaming stations, live sessions, bookings, customer accounts, point-of-sale (POS), equipment maintenance, staff roles, and analytics.

---

## 🌟 Key Features

1. **Interactive 3D Venue & Station Control**:
   - Isometric & perspective 3D view of the venue pods (PC Arena, PS5/Xbox VIP Lounges, VR Booths, Sim Racing Rigs).
   - Real-time station status visualization: Available, Occupied, Reserved, Cleaning, Out of Service.
   - Station inspection side-panel with quick actions (start/pause/extend/transfer/end session).
   - 2D responsive list & floor fallback for mobile or reduced-motion environments.
   - Interactive 3D layout customization mode.

2. **Live Session Management**:
   - Real-time countdown timers, elapsed time, overtime warnings, and audio-visual alerts.
   - Session operations: Start, pause, resume, extend, transfer to other stations with audit logging.
   - Strict double-booking and station conflict prevention.

3. **Bookings & Walk-In Scheduler**:
   - Day and week schedule calendar with station availability filters.
   - Walk-in rapid check-in and reservation conversion.
   - Reservation lifecycle: Pending, Confirmed, Checked In, Completed, Cancelled, No-Show.

4. **Point of Sale (POS) & Billing**:
   - Food, snacks, drinks, and merchandise catalog with inventory stock tracking.
   - Integrated billing: Session rate calculation (minor units/cents) + POS items + discounts + taxes.
   - Split billing, multiple payment methods (Cash, Card, UPI/QR, Customer Wallet).
   - Printable receipts with itemized audit logs.
   - Kitchen / Counter screen for order preparation.

5. **Customer Accounts & Membership Engine**:
   - Customer profiles, visit history, preferred stations.
   - Membership tiers (Silver, Gold, VIP) with discounted hourly rates.
   - Customer digital wallet for prepaid hours and gaming credits.
   - Loyalty rewards points and coupon code engine.

6. **Equipment Inventory & Maintenance**:
   - Platform game library tracking.
   - Hardware inventory (PCs, GPUs, consoles, controllers, VR headsets).
   - Fault reporting, maintenance schedule, and repair status tracking.

7. **Staff Roles & Access Control**:
   - Pre-configured role matrix: Owner, Manager, Cashier, Floor Staff.
   - Role-based UI visibility and server-side permission checks.
   - Shift management, handover notes, and comprehensive audit history.

8. **Reports & Business Intelligence**:
   - Real-time occupancy, active sessions, and revenue summaries.
   - Platform and game popularity metrics, peak hour analysis.
   - Export reports as JSON / CSV.

9. **Customer-Facing Self-Service Portal**:
   - Dedicated portal for guests to browse live station availability, book sessions, manage wallets, order snacks, and submit feedback.

---

## 🚀 Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Package Manager**: npm v9+ (or pnpm / yarn)
- **Modern Web Browser**: Chrome, Edge, Firefox, or Safari with WebGL enabled for 3D views.

---

## 🛠️ Quick Start

```bash
# 1. Install dependencies
npm.cmd install

# 2. Start the local development server
npm.cmd run dev

# 3. Open your browser
# Navigate to: http://localhost:3000
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env.local` to configure optional external services (such as Supabase PostgreSQL):

```env
# App Configuration
NEXT_PUBLIC_APP_NAME="Fifolex Gaming Cafe"
NEXT_PUBLIC_APP_ENV="development"
NEXT_PUBLIC_DEMO_MODE="true"

# Optional Supabase Integration (Leave empty to use built-in offline reactive storage)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

---

## 📁 Project Architecture

```
fifolex/
├── docs/                      # Architectural decisions and open questions
│   ├── PRODUCT_DECISIONS.md
│   └── OPEN_QUESTIONS.md
├── src/
│   ├── app/                   # Next.js App Router pages and API routes
│   │   ├── layout.tsx         # Root layout with providers & nav shell
│   │   ├── page.tsx           # Dashboard overview
│   │   ├── venue/             # Interactive 3D & 2D Floor Plan
│   │   ├── sessions/          # Live Station & Session Controls
│   │   ├── bookings/          # Calendar & Reservations
│   │   ├── pos/               # Food, Drinks & Billing Checkout
│   │   ├── kitchen/           # Kitchen / Counter Order Display
│   │   ├── customers/         # Customer Profiles & Wallet
│   │   ├── equipment/         # Hardware & Maintenance
│   │   ├── staff/             # Shifts, Roles & Audit Logs
│   │   ├── reports/           # Business Intelligence & Exports
│   │   ├── settings/          # Cafe Configuration & 3D Layout Editor
│   │   └── portal/            # Customer-facing self-service booking portal
│   ├── components/            # Reusable UI & 3D components
│   │   ├── 3d/                # React Three Fiber venue models & controls
│   │   ├── ui/                # Buttons, Modals, Cards, Badges, Tables
│   │   ├── layout/            # Sidebar, Header, Breadcrumbs, Role Switcher
│   │   └── shared/            # Receipts, Session Timers, Confirm Dialogs
│   ├── features/              # Feature domain components and controllers
│   ├── lib/                   # Utilities, formatting, currency, permissions
│   ├── types/                 # Strongly-typed domain models & state definitions
│   └── store/                 # Reactive data store with synthetic seed data
└── supabase/                  # SQL migrations & schema for PostgreSQL deployment
```
