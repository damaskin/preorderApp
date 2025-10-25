import { Bot, InlineKeyboard } from 'grammy';
import type { Context } from 'grammy';

import { getRuntimeConfig } from '../config/env';
import { getBranchById, linkBranchToChat } from '../branches/repository';
import {
  applyOrderStatusTransition,
  InvalidStatusTransitionError,
  OrderNotFoundError
} from '../orders/repository';
import {
  ORDER_STATUS_ACTION_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  type OrderRecord,
  type OrderStatus
} from '../orders/types';

const createActorId = (ctx: Context) => {
  const userId = ctx.from?.id;
  return userId ? `telegram:${userId}` : 'telegram:unknown';
};

const KNOWN_STATUSES: OrderStatus[] = ['NEW', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'];

const parseStatus = (value: string | undefined): OrderStatus | null => {
  if (!value) {
    return null;
  }

  return KNOWN_STATUSES.includes(value as OrderStatus) ? (value as OrderStatus) : null;
};

const buildOrderSummary = (order: OrderRecord) => {
  const lines: string[] = [
    `Заказ №${order.number}`,
    order.branchName,
    order.customerName ? `Клиент: ${order.customerName}` : undefined,
    order.scheduledFor ? `К выдаче: ${order.scheduledFor}` : 'ASAP',
    '',
    `Статус: ${ORDER_STATUS_LABELS[order.status]}`
  ].filter((line): line is string => Boolean(line));

  order.items.forEach((item) => {
    const optionsSuffix = item.options.length ? ` (${item.options.join(', ')})` : '';
    lines.push(`• ${item.name} ×${item.qty}${optionsSuffix}`);
  });

  return lines.join('\n');
};

export const buildOrderCard = (order: OrderRecord) => {
  const keyboard = new InlineKeyboard();
  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];

  nextStatuses.forEach((status) => {
    const label = ORDER_STATUS_ACTION_LABELS[status] ?? ORDER_STATUS_LABELS[status];
    keyboard.text(label, `${order.id}:${status}`);
  });

  return {
    text: buildOrderSummary(order),
    replyMarkup: nextStatuses.length ? keyboard : undefined
  } as const;
};

export const createBot = () => {
  const { telegram } = getRuntimeConfig();
  const bot = new Bot<Context>(telegram.botToken);

  bot.command('start', async (ctx) => {
    await ctx.reply(
      'Привет! Этот бот помогает управлять предзаказами. Используйте команду /link <branchId> <secret>, чтобы привязать заведение.'
    );
  });

  bot.command('link', async (ctx) => {
    const { partnerLinkSecret } = getRuntimeConfig().telegram;
    const messageText = ctx.message?.text ?? '';
    const [, branchId, providedSecret] = messageText.trim().split(/\s+/);

    if (!branchId || !providedSecret) {
      await ctx.reply('Укажите идентификатор филиала и секрет. Пример: /link branch-123 your-secret');
      return;
    }

    if (providedSecret !== partnerLinkSecret) {
      await ctx.reply('Секрет не подошёл. Проверьте правильность и попробуйте снова.');
      return;
    }

    if (!ctx.chat?.id || !ctx.from?.id) {
      await ctx.reply('Не удалось определить чат. Попробуйте ещё раз.');
      return;
    }

    const branch = await getBranchById(branchId);

    if (!branch) {
      await ctx.reply('Филиал не найден. Проверьте идентификатор.');
      return;
    }

    const linkedBranch = await linkBranchToChat(branchId, ctx.chat.id, ctx.from.id);

    await ctx.reply(`Филиал «${linkedBranch.name}» теперь привязан к этому чату.`);
  });

  bot.on('callback_query:data', async (ctx) => {
    const callbackData = ctx.callbackQuery.data ?? '';
    const [orderId, statusValue] = callbackData.split(':');

    const nextStatus = parseStatus(statusValue);

    if (!orderId || !nextStatus) {
      await ctx.answerCallbackQuery({ text: 'Некорректная команда', show_alert: true });
      return;
    }

    try {
      const updatedOrder = await applyOrderStatusTransition(orderId, nextStatus, createActorId(ctx));
      const card = buildOrderCard(updatedOrder);

      await ctx.editMessageText(card.text, { reply_markup: card.replyMarkup });
      await ctx.answerCallbackQuery({ text: `Статус: ${ORDER_STATUS_LABELS[nextStatus]}` });
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        await ctx.answerCallbackQuery({ text: 'Заказ не найден', show_alert: true });
        return;
      }

      if (error instanceof InvalidStatusTransitionError) {
        await ctx.answerCallbackQuery({ text: 'Статус уже обновлён', show_alert: true });
        return;
      }

      await ctx.answerCallbackQuery({ text: 'Не удалось обновить заказ', show_alert: true });
    }
  });

  return bot;
};
