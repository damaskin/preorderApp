import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { z } from 'zod';

type RuntimeConfig = {
  telegram: {
    botToken: string;
    webhookSecretToken: string;
    partnerLinkSecret: string;
  };
};

const configSchema = z.object({
  telegram: z.object({
    botToken: z.string().min(1, 'Telegram bot token is required'),
    webhookSecretToken: z
      .string()
      .min(1, 'Telegram webhook secret token is required')
      .describe('Secret token used to validate webhook calls from Telegram'),
    partnerLinkSecret: z
      .string()
      .min(1, 'Telegram partner link secret is required')
      .describe('Secret phrase that authorizes /link commands inside the partner bot')
  })
});

let runtimeConfig: RuntimeConfig | null = null;

export const getRuntimeConfig = (): RuntimeConfig => {
  if (runtimeConfig) {
    return runtimeConfig;
  }

  const config = functions.config();
  const parsed = configSchema.safeParse(config);

  if (!parsed.success) {
    throw new Error(`Invalid runtime configuration: ${parsed.error.message}`);
  }

  runtimeConfig = parsed.data as RuntimeConfig;
  return runtimeConfig;
};

export const initializeFirebaseAdmin = (): admin.app.App => {
  if (admin.apps.length) {
    return admin.app();
  }

  return admin.initializeApp();
};
