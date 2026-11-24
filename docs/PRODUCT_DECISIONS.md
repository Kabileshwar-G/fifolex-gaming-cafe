# Fifolex — Product Architecture & Decisions

This document records the foundational architectural decisions, conventions, and design standards established for Fifolex.

---

## 1. Technology Stack Decisions

### Core Framework: Next.js 14+ (App Router) with React 18+ and TypeScript
- **Rationale**: Next.js App Router provides robust server-side rendering, API route encapsulation, static optimization, and modular routing. Full TypeScript typing ensures domain safety across complex business rules (billing, session lifecycles, booking conflicts).

### 3D Venue Visualization: React Three Fiber (R3F) & Three.js (@react-three/drei)
- **Rationale**: Standardized declarative 3D scene graph within React. Allows station entities to share the exact same reactive state as the 2D tabular management views.
- **Performance & Accessibility**:
  - Implements lightweight procedural 3D geometries (station desks, monitors, neon RGB chassis, VR rings, racing cockpits) with optimized instanced materials for zero-lag rendering.
  - Automatically respects user `prefers-reduced-motion` settings.
  - Full 2D floor grid / list view fallback for mobile viewports, low-power devices, or staff preferring fast tabular interaction.

### Styling & Design System: Tailwind CSS & Lucide Icons
- **Aesthetic**: Premium gaming cafe operations command-center.
  - Background: Deep obsidian (`#090a0f`) and slate panels (`#11141d`).
  - Typography: Clean, high-contrast monospace & sans-serif fonts for operational legibility.
  - Status Indicators (High contrast text + icon + color):
    - **Available**: Emerald (`#10b981`)
    - **Occupied**: Cyan/Blue (`#06b6d4`)
    - **Reserved**: Amber/Gold (`#f59e0b`)
    - **Cleaning**: Purple (`#a855f7`)
    - **Out of Service / Maintenance**: Rose (`#f43f5e`)

### State Management & Data Layer: Reactive Store with LocalStorage & Supabase Adapter Ready
- **Rationale**: Ensures the application is 100% functional, testable, and demonstrable in local development without mandatory external cloud credentials.
- **Supabase Compatibility**: The domain types and store actions map directly to PostgreSQL tables with full row-level security (RLS) policies prepared in `supabase/migrations/001_initial_schema.sql`.

---

## 2. Business Rules & Financial Integrity

### Exact Currency Handling
- All monetary amounts are stored as **integer minor units** (e.g. cents / paise / pence) to prevent floating-point rounding errors.
- Pricing engine computes:
  $$\text{Total} = (\text{Station Base Rate} \times \text{Duration Hours}) + \text{POS Items} - \text{Discounts} + \text{Tax}$$
- Audit records are generated for all financial transactions, refunds, and rate overrides.

### Session Lifecycle & Conflict Prevention
- A station can only be in one active primary state at a time.
- Starting a session or confirming a booking locks the station.
- Transfers record the origin, destination, timestamp, and responsible staff ID.

### Role-Based Access Control (RBAC)
- 4 Standard Roles:
  1. **Owner**: Full access, financial reports, pricing configuration, staff management, 3D venue layout edits.
  2. **Manager**: Station ops, bookings, customer profiles, refunds, inventory adjustments, daily reports.
  3. **Cashier**: Check-in, session timers, POS checkout, payment collection, receipts.
  4. **Floor Staff**: Station statuses, cleaning/maintenance flagging, equipment inspections.
- Built-in role switcher enables immediate inspection and verification of role restrictions in demo mode.
