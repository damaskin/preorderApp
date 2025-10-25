import { beforeEach, describe, expect, it, vi } from 'vitest';

const configMock = vi.fn();

vi.mock('firebase-functions', () => ({
  config: configMock
}));

vi.mock('firebase-admin', () => ({
  apps: [],
  app: vi.fn(),
  initializeApp: vi.fn(() => ({ name: 'mock-app' }))
}));

const loadModule = async () => {
  const module = await import('./env');
  return module;
};

beforeEach(() => {
  vi.resetModules();
  configMock.mockReset();
});

describe('getRuntimeConfig', () => {
  it('normalizes snake_case Firebase config keys to camelCase runtime config', async () => {
    configMock.mockReturnValue({
      telegram: {
        bot_token: 'bot-token',
        webhook_secret_token: 'webhook-secret',
        partner_link_secret: 'link-secret'
      }
    });

    const { getRuntimeConfig } = await loadModule();
    const config = getRuntimeConfig();

    expect(config).toEqual({
      telegram: {
        botToken: 'bot-token',
        webhookSecretToken: 'webhook-secret',
        partnerLinkSecret: 'link-secret'
      }
    });
  });

  it('prefers camelCase overrides when both naming styles are present', async () => {
    configMock.mockReturnValue({
      telegram: {
        bot_token: 'legacy-token',
        webhook_secret_token: 'legacy-webhook',
        partner_link_secret: 'legacy-link',
        botToken: 'bot-token',
        webhookSecretToken: 'webhook-secret',
        partnerLinkSecret: 'link-secret'
      }
    });

    const { getRuntimeConfig } = await loadModule();
    const config = getRuntimeConfig();

    expect(config.telegram).toEqual({
      botToken: 'bot-token',
      webhookSecretToken: 'webhook-secret',
      partnerLinkSecret: 'link-secret'
    });
  });

  it('throws a descriptive error when required values are missing', async () => {
    configMock.mockReturnValue({ telegram: {} });

    const { getRuntimeConfig } = await loadModule();

    expect(() => getRuntimeConfig()).toThrowError(
      /Invalid runtime configuration: Telegram bot token is required/
    );
  });

  it('caches the parsed runtime config after the first call', async () => {
    configMock.mockReturnValue({
      telegram: {
        bot_token: 'bot-token',
        webhook_secret_token: 'webhook-secret',
        partner_link_secret: 'link-secret'
      }
    });

    const { getRuntimeConfig } = await loadModule();

    getRuntimeConfig();
    getRuntimeConfig();

    expect(configMock).toHaveBeenCalledTimes(1);
  });
});
