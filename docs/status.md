# Project Status Log

_Last updated: 2025-10-25 18:05 UTC_

## Current Context
- Repository now contains the initial Firebase Cloud Functions workspace that will power the Telegram bot and backend APIs.
- Telegram bot now drives partner workflow end-to-end for order notifications and status updates using Firestore as the source of truth.
- Documentation continues to lead implementation priorities while the bot, backend, and PWA foundations are scaffolded.

## Completed
- Captured product vision, scope, and architecture priorities in [project-overview.md](./project-overview.md).
- Confirmed Firebase (Cloud Firestore + Storage + FCM) as the primary data and notification platform for the MVP.
- Selected Firebase Cloud Functions (Node.js 20) as the initial runtime for the Telegram bot and backend APIs.
- Scaffolded the Cloud Functions workspace with TypeScript, linting, and deployment scripts.
- Implemented Telegram bot commands for partner chat linking and secure status transitions backed by Firestore transactions.
- Added Firestore trigger that sends formatted order cards to linked partner chats via Telegram.
- Introduced Firestore-backed customer messaging profiles and push notification helpers to deliver status updates via FCM.
- Documented Firebase project configuration and runtime secret management for all runtimes.

## In Progress / Upcoming Tasks
1. **Technical Foundations**
   - Configure Firebase project, security rules, and environment management.
   - Define shared TypeScript configuration for upcoming client/admin packages.
2. **Telegram Bot MVP**
   - Configure hosting and webhook endpoint in production Firebase project.
   - Implement backend bridge that persists status changes and triggers notifications for customer push (FCM/Web Push). ✅
   - Design mini app shell that loads the PWA ordering flow.
3. **Client Ordering Flow**
   - Implement authentication (phone/email or Telegram login) and city/venue selection.
   - Build menu browsing, cart, scheduling, and payment screens with Firebase integration.
4. **Admin Tooling**
   - Scaffold minimal admin interface for partners, branches, menus, and promotions CRUD.
5. **Observability & Operations**
   - Establish logging, alerting, and analytics tracking (order funnel, SLA metrics).

## Open Questions & Decisions Needed
- Select payment service provider(s) per launch geography and confirm tokenization approach.
- Define initial cities/partners for pilot launch to guide seed data.
- Finalize order lead-time defaults and auto-cancellation policies.

## Next Status Update
Document progress after scaffolding the project structure and initial bot endpoints, including deployment targets and testing strategy.

