# Project Overview

## Vision
PreorderApp is a Telegram-first ordering experience that lets guests place and pay for takeaway food or drinks before they arrive at a venue. The product launches as a Telegram bot with an embedded mini web app, then expands into a responsive PWA that can also run as a standalone website.

The service focuses on:
- Reducing queue time for customers who buy coffee or food “on the go”.
- Increasing venue throughput and revenue through predictable preorder flows.
- Providing a unified hub that aggregates local venues and their promotions.

## Target Platforms
| Platform | Purpose |
| --- | --- |
| Telegram Bot + Mini App | Primary touchpoint for customers and partners in the MVP. Handles ordering, partner status updates, and notifications. |
| PWA / Responsive Web | Secondary experience that mirrors the mini app, supports add-to-home-screen and offline resilience. |
| Web Admin Portal | Backoffice for administrators to moderate venues, menu items, promotions, and view analytics. |

## Key Roles
- **Customer (User):** places advance orders, selects pick-up time, tracks status updates, manages saved payment methods, receives push notifications, and views order history.
- **Partner (Business):** manages venue settings, updates order statuses through the Telegram bot in MVP, and maintains menu availability.
- **Administrator (Owner):** onboards partners and branches, moderates menus and promotions, configures commissions, and monitors platform-wide analytics.

## Core Customer Experience
1. Pick a venue (optionally filtered by cuisine or proximity) and review menu items with photos, prices, and option groups (e.g., size, milk type).
2. Add products to the cart, choosing ASAP fulfilment or scheduling for a specific time within venue business hours.
3. Pay online with a tokenized card and receive a digital order number.
4. Track status transitions in real time: **New → In Progress → Ready → Completed** (with optional **Cancelled** edge cases).
5. Receive push notifications (Telegram and web push) when the order is accepted and ready for pickup.

## Partner Workflow (MVP)
- Receive new-order alerts inside the Telegram bot.
- Update statuses via inline buttons: **Accept**, **In Progress**, **Ready**, **Cancel**.
- Optionally pause intake, note ingredient issues, or flag delays.

A lightweight partner web portal (KDS-lite) is planned for post-MVP once the Telegram-based flow is validated.

## Administrator Responsibilities
- Manage partner accounts, branches, business hours, and venue availability.
- Approve or reject new menu items and promotional campaigns before publication.
- Configure commission rates, payment integrations, and notification keys.
- Review analytics: order volume, average ticket size, SLA compliance, and partner performance.

## Functional Scope (MVP)
- Authentication via email or phone (Telegram identity where possible).
- Venue selection by city with filtering and search.
- Menu browsing with option groups and price deltas.
- Cart management, promo code placeholder, and tip-ready total calculation.
- Tokenized card payments, including card vaulting for one-click repeat purchases.
- Scheduled orders with lead-time validation and ETA display.
- Push notifications for status changes and promotions.
- Order history with repeat-order shortcuts.
- Admin CRUD for partners, branches, menus, and promotions.

## Data & Storage Strategy
- **Primary database:** Firebase (Cloud Firestore) storing partners, branches, menu items, orders, status timelines, and user profiles.
- **Media assets:** Firebase Storage or compatible object storage for product photos and brand assets.
- **Payments:** External PSP (to be selected per launch geography) issuing card tokens that are stored in user documents.
- **Notifications:** Firebase Cloud Messaging (FCM) for mobile/web push; Telegram bot API for partner status updates.

### Example Collections
- `partners`: metadata, contact info, active flag.
- `branches`: nested under partners or separate collection keyed by `partnerId`, includes geodata and business hours.
- `menuItems`: includes option groups and availability toggles.
- `orders`: references user and branch IDs, contains line items, totals, readiness time, status history, and payment metadata.
- `users`: contact channels, saved cards, notification preferences.
- `promotions`: targeting rules, schedule windows, and delivery channels.
- `statusEvents`: timeline entries for auditing transitions.

## Integrations
- **Telegram Bot:** Receives webhooks for partner interactions, delivers order cards, and forwards status updates back to the backend.
- **Payment Provider:** Supports card tokenization and charges; requires webhook verification for asynchronous events (success, failure, refund).
- **Push Services:** FCM/Web Push for customer notifications; optional email fallbacks.

## Technical Architecture Decisions
- **Backend runtime:** Firebase Cloud Functions on Node.js 20 host the Telegram webhook, order status transitions, and future REST APIs.
- **Language & tooling:** TypeScript across Cloud Functions with ESLint, Vitest, and Firebase Emulator support to unify bot/backend logic.
- **Configuration management:** Firebase runtime config stores secrets such as Telegram tokens; environment-specific projects are mapped through `.firebaserc`.

## Non-Functional Considerations
- Ensure responsive design for both mini app and PWA shells, optimized for sub-2s FCP on 4G connections.
- Enforce RBAC so partners only view their own venues and orders.
- Secure all traffic via HTTPS, sign external webhooks, and minimize stored PII.
- Provide offline tolerance through cached app shell, menu assets, and queued requests that synchronize when connectivity is restored.

## Roadmap Highlights
1. **MVP Launch**
   - Telegram mini app ordering experience with Firebase backend.
   - Partner status handling via bot inline actions.
   - Admin CRUD console for core catalog entities.
   - Push notifications for order readiness.
2. **Post-MVP Enhancements**
   - Partner web dashboard (real-time order queue, timers, pause controls).
   - Capacity management and slot-based scheduling.
   - Advanced analytics, geo-mapped venue discovery, loyalty incentives, and native wallet payments.

