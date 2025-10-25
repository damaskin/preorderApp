import * as admin from 'firebase-admin';

export type UserDocument = {
  messagingTokens?: string[];
  language?: string;
};

export type UserMessagingProfile = {
  tokens: string[];
  language?: string;
};

type RawUserDocument = {
  messagingTokens?: unknown;
  language?: unknown;
};

const collection = () => admin.firestore().collection('users');

const normalizeTokens = (tokens: unknown): string[] => {
  if (typeof tokens === 'string') {
    const trimmed = tokens.trim();
    return trimmed ? [trimmed] : [];
  }

  if (!Array.isArray(tokens)) {
    return [];
  }

  const unique = new Set<string>();

  tokens.forEach((token) => {
    if (typeof token !== 'string') {
      return;
    }

    const trimmed = token.trim();

    if (!trimmed) {
      return;
    }

    unique.add(trimmed);
  });

  return Array.from(unique);
};

const normalizeLanguage = (language: unknown): string | undefined => {
  if (typeof language !== 'string') {
    return undefined;
  }

  const trimmed = language.trim();
  return trimmed || undefined;
};

export const getUserMessagingProfile = async (
  userId: string
): Promise<UserMessagingProfile | null> => {
  const snapshot = await collection().doc(userId).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as RawUserDocument;
  const tokens = normalizeTokens(data.messagingTokens);
  const language = normalizeLanguage(data.language);

  if (!tokens.length) {
    return { tokens: [], language };
  }

  return {
    tokens,
    language
  };
};
