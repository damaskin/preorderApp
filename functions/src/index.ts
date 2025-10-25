import * as functions from 'firebase-functions';
import { webhookCallback } from 'grammy';

import { createBot, buildOrderCard } from './telegram/handler';
import { getRuntimeConfig, initializeFirebaseAdmin } from './config/env';
import { getBranchById } from './branches/repository';
import type { OrderDocument, OrderRecord } from './orders/types';
import { getUserMessagingProfile } from './users/repository';
import { buildOrderStatusNotification, sendOrderStatusNotification } from './notifications/push';

initializeFirebaseAdmin();

const bot = createBot();
const handleUpdate = webhookCallback(bot, 'http');

export const telegramWebhook = functions.https.onRequest(async (req, res) => {
  const { telegram } = getRuntimeConfig();
  const secretToken = req.get('X-Telegram-Bot-Api-Secret-Token');

  if (secretToken !== telegram.webhookSecretToken) {
    functions.logger.warn('Rejected webhook call because of invalid secret token');
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    await handleUpdate(req, res);
  } catch (error) {
    functions.logger.error('Failed to process Telegram update', error);
    res.status(500).send('Internal Server Error');
  }
});

export const notifyPartnerOnOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot) => {
    const order = snapshot.data() as OrderDocument;
    const branch = await getBranchById(order.branchId);

    if (!branch?.telegramChatId) {
      functions.logger.info('No Telegram chat linked for branch', {
        branchId: order.branchId,
        orderId: snapshot.id
      });
      return;
    }

    const card = buildOrderCard({ id: snapshot.id, ...order });

    await bot.api.sendMessage(branch.telegramChatId, card.text, {
      reply_markup: card.replyMarkup
    });
  });

export const notifyCustomerOnOrderStatus = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change) => {
    const before = change.before.data() as OrderDocument;
    const after = change.after.data() as OrderDocument;

    if (before.status === after.status) {
      return;
    }

    const order: OrderRecord = { ...after, id: change.after.id };
    if (!after.userId) {
      functions.logger.info('Order has no user reference; skipping push notification', {
        orderId: change.after.id
      });
      return;
    }

    const profile = await getUserMessagingProfile(after.userId);

    if (!profile || !profile.tokens.length) {
      functions.logger.info('No messaging tokens registered for user; skipping push notification', {
        orderId: change.after.id,
        userId: after.userId
      });
      return;
    }

    const notification = buildOrderStatusNotification(order, {
      language: profile.language
    });

    if (!notification) {
      return;
    }

    try {
      await sendOrderStatusNotification(profile.tokens, notification);
    } catch (error) {
      functions.logger.error('Failed to send order status notification', {
        orderId: change.after.id,
        userId: after.userId,
        error
      });
    }
  });
