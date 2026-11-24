# Fifolex — Open Decisions & Configurable Defaults

This document tracks cafe-specific operational questions (from Section 10 of the Master Brief). Since real cafe operational values must not be fabricated, Fifolex implements sensible, clearly labeled synthetic defaults that are fully configurable via the **Cafe Settings** UI.

| Item | Question | Configurable Default Value | Where Configured |
|---|---|---|---|
| **Platforms & Types** | What platforms does the cafe operate? | PC Ultra (12), PS5 VIP Lounge (6), Xbox Series X (4), VR Arena (2), Sim Racing Rig (2) | Settings -> Station Types |
| **Default Pricing** | What are the hourly rates per platform? | PC: $6.00/hr, PS5: $8.00/hr, Xbox: $7.00/hr, VR: $15.00/hr, Racing: $14.00/hr | Settings -> Station Rates |
| **Session Rules** | Time increments, grace period, overtime rate? | Min duration: 60 min; Increments: 30 min; Grace period: 10 min; Overtime alert: 5 min before expiry | Settings -> Session Rules |
| **Bookings & Deposits** | Reservations vs walk-ins, required deposits? | Both supported. Walk-in default deposit: $0. Online booking deposit: 50% of session value. | Settings -> Booking Policies |
| **Cancellation Policy** | Cancellation window & refunds? | Free cancellation up to 2 hours before scheduled slot; 50% deposit forfeiture inside 2 hours. | Settings -> Booking Policies |
| **Payment Methods** | Accepted payment types? | Cash, Credit/Debit Card, UPI / QR Scan, Prepaid Customer Wallet | Settings -> Payment Methods |
| **Cafe / POS Menu** | Does the cafe sell food, drinks, or merch? | Pre-seeded with 12 synthetic items (energy drinks, soda, artisan coffee, nachos, pizza slices, gaming mousepad) with active stock tracking. | POS -> Menu Catalog |
| **Memberships** | Are memberships and prepaid packages enabled? | Enabled. 3 Tiers: Silver (5% discount), Gold (15% discount), VIP (25% discount). Prepaid hourly packages: 10 hrs, 25 hrs, 50 hrs. | Customers -> Memberships |
| **Staff Roles** | Which roles and permissions are required? | Standard 4 roles: Owner, Manager, Cashier, Floor Staff with pre-configured permission matrix. | Staff -> Roles & Permissions |
| **Customer Online Booking**| Should customers book online in first release? | Yes, complete customer self-service portal provided at `/portal`. | Settings -> Customer Portal |
| **Timezone & Currency** | Operational timezone and currency code? | Default currency: USD ($); Timezone: America/New_York (configurable to any IANA timezone). | Settings -> Localization |
| **3D Layout** | Exact physical venue blueprint? | Synthetic 26-station modular floor plan across 4 zones: Main PC Floor, VIP Console Lounge, VR Holo-Zone, Sim Racing Paddock. Editable via Layout Editor. | Settings -> Venue Layout |
