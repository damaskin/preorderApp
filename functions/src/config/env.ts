import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { z } from 'zod';

const telegramConfigSchema = z.object({
  botToken: z.string().min(1, 'Telegram bot token is required'),
  webhookSecretToken: z
    .string()
    .min(1, 'Telegram webhook secret token is required')
    .describe('Secret token used to validate webhook calls from Telegram'),
  partnerLinkSecret: z
    .string()
    .min(1, 'Telegram partner link secret is required')
    .describe('Secret phrase that authorizes /link commands inside the partner bot')
});

const configSchema = z.object({
  telegram: telegramConfigSchema
});

type RuntimeConfig = z.infer<typeof configSchema>;

type TelegramRawConfig = {
  botToken?: unknown;
  webhookSecretToken?: unknown;
  partnerLinkSecret?: unknown;
  bot_token?: unknown;
  webhook_secret_token?: unknown;
  partner_link_secret?: unknown;
  [key: string]: unknown;
};

type RawRuntimeConfig = {
  telegram?: TelegramRawConfig;
};

const normalizeTelegramConfig = (
  telegram: TelegramRawConfig | undefined
): Record<string, unknown> => {
  if (!telegram) {
    return {};
  }

  const {
    bot_token: snakeBotToken,
    webhook_secret_token: snakeWebhookSecretToken,
    partner_link_secret: snakePartnerLinkSecret,
    ...rest
  } = telegram;

  return {
    ...rest,
    botToken: telegram.botToken ?? snakeBotToken,
    webhookSecretToken: telegram.webhookSecretToken ?? snakeWebhookSecretToken,
    partnerLinkSecret: telegram.partnerLinkSecret ?? snakePartnerLinkSecret
  };
};

const normalizeRuntimeConfig = (config: RawRuntimeConfig): RawRuntimeConfig => {
  if (!config.telegram || typeof config.telegram !== 'object') {
    return config;
  }

  return {
    ...config,
    telegram: normalizeTelegramConfig(config.telegram)
  };
};

let runtimeConfig: RuntimeConfig | null = null;

export const getRuntimeConfig = (): RuntimeConfig => {
  if (runtimeConfig) {
    return runtimeConfig;
  }

  const rawConfig = functions.config() as RawRuntimeConfig;
  const normalizedConfig = normalizeRuntimeConfig(rawConfig);
  const parsed = configSchema.safeParse(normalizedConfig);

  if (!parsed.success) {
    throw new Error(`Invalid runtime configuration: ${parsed.error.message}`);
  }

  runtimeConfig = parsed.data;
  return runtimeConfig;
};

export const initializeFirebaseAdmin = (): admin.app.App => {
  if (admin.apps.length) {
    return admin.app();
  }

  return admin.initializeApp();
};
