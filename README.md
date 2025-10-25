# PreorderApp

Telegram-first preorder platform that lets guests schedule and pay for takeaway food and drinks before arriving at a venue. The repository will host:

- A Telegram bot with a mini web app powering the ordering experience.
- A PWA that mirrors the mini app for mobile and desktop browsers.
- Admin tooling for partners and the platform owner.

## Project Documentation

- [Project overview](docs/project-overview.md) — product vision, scope, and roadmap.
- [Project status log](docs/status.md) — running log of completed work, upcoming tasks, and open questions.
- [Firebase configuration](docs/firebase.md) — project IDs, runtime secrets, and Firestore collection expectations.

Additional documents will be added as implementation begins (architecture decisions, API contracts, testing strategy, etc.).

## Repository Structure

- `functions/` — Firebase Cloud Functions project that hosts the Telegram bot webhook and backend APIs.
- `docs/` — living documentation for the product, delivery status, and upcoming tasks.

## Getting Started

1. Install dependencies for the Cloud Functions workspace:

   ```bash
   cd functions
   npm install
   ```

2. Configure Firebase CLI access and set the required runtime config values:

   ```bash
   firebase login
   firebase use preorderapp-ed071
   firebase functions:config:set \
     telegram.bot_token="<token>" \
     telegram.webhook_secret_token="<secret>" \
     telegram.partner_link_secret="<link-secret>"
   ```

3. Run the local emulator for iterative development:

   ```bash
   npm run dev
   ```

4. Seed Firestore with the required collections (`branches`, `orders`, `users`) and link partner chats using the `/link` command from the bot.

5. Ensure ordering clients register customer messaging tokens in `users/{userId}.messagingTokens`; Cloud Functions will reuse them for push updates when order statuses change.

6. Deploy the Cloud Functions when ready:

   ```bash
   npm run deploy
   ```

> The repository will expand with the PWA client, admin interfaces, and shared libraries as implementation progresses.
