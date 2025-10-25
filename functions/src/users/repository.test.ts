import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUserMessagingProfile } from './repository';

type FirestoreSnapshot = {
  exists: boolean;
  data: () => Record<string, unknown>;
};

const getMock = vi.fn<[], Promise<FirestoreSnapshot>>();
const docMock = vi.fn();
const collectionMock = vi.fn();
const firestoreMock = vi.fn();

vi.mock('firebase-admin', () => ({
  firestore: firestoreMock
}));

docMock.mockImplementation(() => ({ get: getMock }));
collectionMock.mockImplementation(() => ({ doc: docMock }));
firestoreMock.mockImplementation(() => ({ collection: collectionMock }));

const mockSnapshot = (snapshot: FirestoreSnapshot) => {
  getMock.mockResolvedValue(snapshot);
};

describe('users/repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    docMock.mockImplementation(() => ({ get: getMock }));
    collectionMock.mockImplementation(() => ({ doc: docMock }));
    firestoreMock.mockImplementation(() => ({ collection: collectionMock }));
  });

  it('returns null when user document does not exist', async () => {
    mockSnapshot({ exists: false, data: () => ({}) });

    await expect(getUserMessagingProfile('user-1')).resolves.toBeNull();
  });

  it('returns messaging tokens and language when present', async () => {
    mockSnapshot({
      exists: true,
      data: () => ({
        messagingTokens: [' token-a ', 'token-b', 'token-a'],
        language: 'ru'
      })
    });

    await expect(getUserMessagingProfile('user-1')).resolves.toEqual({
      tokens: ['token-a', 'token-b'],
      language: 'ru'
    });
  });

  it('filters out invalid or empty tokens', async () => {
    mockSnapshot({
      exists: true,
      data: () => ({
        messagingTokens: ['token-a', '', null, 123, '  '],
        language: 'en'
      })
    });

    await expect(getUserMessagingProfile('user-1')).resolves.toEqual({
      tokens: ['token-a'],
      language: 'en'
    });
  });

  it('supports single string token entries', async () => {
    mockSnapshot({
      exists: true,
      data: () => ({
        messagingTokens: 'single-token'
      })
    });

    await expect(getUserMessagingProfile('user-1')).resolves.toEqual({
      tokens: ['single-token'],
      language: undefined
    });
  });

  it('normalizes language field and returns empty token list', async () => {
    mockSnapshot({
      exists: true,
      data: () => ({
        messagingTokens: [],
        language: '  '
      })
    });

    await expect(getUserMessagingProfile('user-1')).resolves.toEqual({
      tokens: [],
      language: undefined
    });
  });
});
