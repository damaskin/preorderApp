# Firebase Project Configuration

The project uses the Firebase project **preorderapp-ed071**. The following snippet represents the web configuration that must be
used by client applications (PWA, Telegram mini app):

```ts
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyDVnx4cdBPaFvna8Ma0EhxkQKzl6YV58Ow',
  authDomain: 'preorderapp-ed071.firebaseapp.com',
  projectId: 'preorderapp-ed071',
  storageBucket: 'preorderapp-ed071.firebasestorage.app',
  messagingSenderId: '99934162405',
  appId: '1:99934162405:web:bb5ff2a43665e113d5f30c'
};

export const app = initializeApp(firebaseConfig);
```

> The Firebase web API key is not a secret, but other credentials (service accounts, Telegram tokens, partner link secret) must
remain outside of version control.

## Runtime Config Secrets

Configure Firebase Functions runtime values via the CLI:

```bash
firebase functions:config:set \
  telegram.bot_token="<telegram-bot-token>" \
  telegram.webhook_secret_token="<webhook-secret>" \
  telegram.partner_link_secret="<link-secret>"
```

Recommended `partner_link_secret` format: a long, random string (for example generated with `openssl rand -base64 32`). Share
it only with trusted partner admins.

> Production values:
> - `telegram.bot_token`: `8157314395:AAEIy2wo1mi1jVRDXf1jvscJLHNnpj3Lpdc`
> - `telegram.webhook_secret_token`: Generate and set during deployment.
> - `telegram.partner_link_secret`: Generate a per-environment secret and share only with vetted venue admins.

## Firestore Collections

- `branches/{branchId}` — partner venue metadata. Required fields:
  - `name`: string
  - `partnerId`: string
  - `telegramChatId` (number, optional): set automatically after `/link` command.
- `orders/{orderId}` — order payload synchronized from the ordering flow. Required fields:
  - `number`: numeric human-friendly order number.
  - `userId`: reference to the `users/{userId}` document that created the order.
  - `branchId`: string (must match an existing branch document).
  - `branchName`: string (displayed to partners in Telegram).
  - `customerName`: optional string displayed to partner staff.
  - `status`: one of `NEW`, `IN_PROGRESS`, `READY`, `COMPLETED`, `CANCELLED`.
  - `items`: array of items with `name`, `qty`, and `options`.
  - `scheduledFor`: optional ISO string for pickup time.
  - `timeline`: optional array tracking status history (the bot appends to this array).
- `users/{userId}` — customer profile metadata synchronized from the client app.
  - `messagingTokens`: array of FCM/Web Push tokens registered by the customer devices.
  - `language`: optional locale code (`ru`, `ro`, `en`, ...). Used later for localized notifications.

When a new `orders/{orderId}` document is created, the Cloud Function `notifyPartnerOnOrder` automatically sends the order card to the linked partner chat.

Status transitions trigger `notifyCustomerOnOrderStatus`, which reads the `userId` reference, loads the registered messaging tokens, and pushes an FCM notification containing the new status label and identifiers so the PWA/mini-app can update instantly.
